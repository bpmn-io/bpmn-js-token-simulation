import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isPlane
} from 'bpmn-js/lib/util/DrilldownUtil';

import { isAncestor } from '../../util/ElementHelper';


/**
 * Orders elements using a Depth-First Search traversal of the process
 * graph, starting from start events and following sequence flows.
 *
 * This ensures elements are visited in a stable, predictable order
 * that matches the process flow.
 */
export default function ElementOrder(elementRegistry, canvas) {
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
}

ElementOrder.$inject = [
  'elementRegistry',
  'canvas'
];

/**
 * Return all descendants of `parent` in DFS process order:
 *   1. FlowNodes in DFS order (start events first, follow sequence flows,
 *      recurse into subprocess children before outgoing flows)
 *   2. Any remaining non-FlowNode descendants appended at the end
 *
 * @param {djs.model.Base} [parent] root element; defaults to current root
 * @return {djs.model.Base[]}
 */
ElementOrder.prototype.getOrderedElements = function(parent) {
  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  if (!parent) {
    return [];
  }

  const result = [];
  const visited = new Set();

  this._collectDFS(parent, result, visited);

  // Append any remaining descendants not yet visited
  // (non-FlowNode elements or those unreachable from start events)
  this._elementRegistry.forEach(el => {
    if (isAncestor(parent, el) && !isPlane(el) && !visited.has(el.id)) {
      result.push(el);
      visited.add(el.id);
    }
  });

  return result;
};

/**
 * Collect FlowNode children of `levelParent` in DFS order, appending
 * them to `result`.
 *
 * Traversal priority within each element:
 *   1. Sequence flow targets (depth-first)
 *   2. Boundary event attachers
 *   3. Message flow targets (deferred until after all sequence-flow-reachable
 *      elements in this scope are exhausted)
 *
 * Participant and Lane containers are recursed into after the local
 * FlowNode DFS, so collaboration diagrams are ordered correctly.
 *
 * @param {djs.model.Base} levelParent
 * @param {djs.model.Base[]} result
 * @param {Set<string>} visited
 */
ElementOrder.prototype._collectDFS = function(levelParent, result, visited) {
  const children = [];

  // Participant / Lane containers to recurse into after local DFS
  const containers = [];

  this._elementRegistry.forEach(el => {
    if (el.parent !== levelParent || isPlane(el)) {
      return;
    }
    if (is(el, 'bpmn:FlowNode')) {
      children.push(el);
    } else if (is(el, 'bpmn:Participant') || is(el, 'bpmn:Lane')) {
      containers.push(el);
    }
  });

  const startEvents = children.filter(el => is(el, 'bpmn:StartEvent'));

  // Message flow targets collected during DFS; processed after all
  // sequence-flow-reachable elements in this scope.
  const deferredMessageTargets = [];

  const dfs = (element) => {
    if (visited.has(element.id)) {
      return;
    }

    visited.add(element.id);
    result.push(element);

    // Recurse into subprocess children before following outgoing flows,
    // so the subprocess content is grouped with the subprocess itself.
    if (is(element, 'bpmn:SubProcess')) {
      this._collectDFS(element, result, visited);
    }

    // 1. Sequence flows first
    for (const outgoing of (element.outgoing || [])) {
      if (is(outgoing, 'bpmn:SequenceFlow') && outgoing.target) {
        if (!visited.has(outgoing.id)) {
          visited.add(outgoing.id);
          result.push(outgoing);
        }
        dfs(outgoing.target);
      }
    }

    // 2. Boundary event attachers
    for (const attacher of (element.attachers || [])) {
      dfs(attacher);
    }

    // 3. Defer message flow targets — visited after all sequence-flow-
    //    reachable elements in the current scope are exhausted.
    for (const outgoing of (element.outgoing || [])) {
      if (is(outgoing, 'bpmn:MessageFlow') && outgoing.target &&
          !visited.has(outgoing.target.id)) {
        deferredMessageTargets.push({ flow: outgoing, target: outgoing.target });
      }
    }
  };

  for (const start of startEvents) {
    dfs(start);
  }

  // Append any FlowNode children not reached via start events
  for (const child of children) {
    if (!visited.has(child.id)) {
      dfs(child);
    }
  }

  // Recurse into Participant / Lane containers after the local FlowNode DFS
  for (const container of containers) {
    if (!visited.has(container.id)) {
      visited.add(container.id);
      result.push(container);
    }
    this._collectDFS(container, result, visited);
  }

  // Process deferred message flow targets LAST — after all sequence-flow-
  // reachable elements (and their sub-pools) have been visited.
  for (const { flow, target } of deferredMessageTargets) {
    if (!visited.has(flow.id)) {
      visited.add(flow.id);
      result.push(flow);
    }
    if (!visited.has(target.id)) {
      if (is(target, 'bpmn:Participant')) {
        this._collectDFS(target, result, visited);
      } else {
        dfs(target);
      }
    }
  }
};
