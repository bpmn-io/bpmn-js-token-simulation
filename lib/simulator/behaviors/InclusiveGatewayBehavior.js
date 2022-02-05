import {
  filterSequenceFlows, isSequenceFlow
} from '../util/ModelUtil';


export default function InclusiveGatewayBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:InclusiveGateway', this);
}

InclusiveGatewayBehavior.prototype.enter = function(context) {
  this._tryJoin(context);
};

InclusiveGatewayBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  // depends on UI to properly configure activeOutgoing for
  // each inclusive gateway

  const outgoings = filterSequenceFlows(element.outgoing);

  // fork based on configured active outgoings
  if (outgoings.length > 1) {

    const {
      activeOutgoing = []
    } = this._simulator.getConfig(element);

    if (!activeOutgoing.length) {
      throw new Error('no outgoing configured');
    }

    for (const outgoing of activeOutgoing) {
      this._simulator.enter({
        element: outgoing,
        scope: scope.parent
      });
    }

  } else {

    // exit like any activity
    this._activityBehavior.exit(context);
  }

};

InclusiveGatewayBehavior.prototype._tryJoin = function(context) {

  const remainingScopes = this._getRemainingScopes(context);

  const remainingElements = remainingScopes.map(scope => scope.element);

  // join right away if possible
  // this implies that there are no remaining scopes
  // or non of the remaining scopes are reachable
  if (!this._canReachAnyElement(remainingElements, context.element)) {
    return this._join(context);
  }

  const elementScopes = this._getElementScopes(context);

  const {
    scope
  } = context;

  // only subscribe to changes with the first
  // element scope; prevent unneeded computation
  if (elementScopes[0] !== scope) {
    return;
  }

  const event = this._simulator.waitForScopes(scope, remainingScopes);

  const subscription = this._simulator.subscribe(scope, event, () => {
    subscription.remove();

    this._tryJoin(context);
  });
};

/**
 * Get scopes that may potentially be waited for,
 * in the context of an inclusive gateway.
 *
 * @param {object} context
 * @return {object[]}
 */
InclusiveGatewayBehavior.prototype._getRemainingScopes = function(context) {
  const {
    scope,
    element
  } = context;

  const {
    parent: parentScope
  } = scope;

  return this._simulator.findScopes(
    scope => scope.parent === parentScope && scope.element !== element
  );
};

InclusiveGatewayBehavior.prototype._join = function(context) {
  const elementScopes = this._getElementScopes(context);

  for (const childScope of elementScopes) {

    if (childScope !== context.scope) {

      // complete joining child scope
      this._simulator.destroyScope(childScope.complete(), context.scope);
    }
  }

  this._simulator.exit(context);
};

/**
 * Get scopes on the element for the given context.
 *
 * @param {object} context
 *
 * @return {object[]} scopes
 */
InclusiveGatewayBehavior.prototype._getElementScopes = function(context) {
  const {
    element,
    scope
  } = context;

  return this._simulator.findScopes({
    parent: scope.parent,
    element
  });
};

/**
 * Return true if any elements can be reached
 * from the current element, searching the execution
 * graph backwards.
 *
 * @param {object[]} elements
 * @param {object} currentElement
 * @param {Set<object>} traversed
 *
 * @return {boolean}
 */
InclusiveGatewayBehavior.prototype._canReachAnyElement = function(elements, currentElement, traversed = new Set()) {

  if (!elements.length) {
    return false;
  }

  // avoid infinite recursion
  if (traversed.has(currentElement)) {
    return false;
  }

  traversed.add(currentElement);

  if (elements.some(e => e === currentElement)) {
    return true;
  }

  if (isSequenceFlow(currentElement)) {
    return this._canReachAnyElement(elements, currentElement.source, traversed);
  }

  const incomingFlows = filterSequenceFlows(currentElement.incoming);

  for (const flow of incomingFlows) {
    if (this._canReachAnyElement(elements, flow, traversed)) {
      return true;
    }
  }

  return false;
};

InclusiveGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];