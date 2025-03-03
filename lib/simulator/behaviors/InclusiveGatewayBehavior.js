import {
  filterSequenceFlows,
  isLinkCatch,
  isLinkThrow,
  isSequenceFlow
} from '../util/ModelUtil';

import {
  getEventDefinition
} from '../../util/ElementHelper';

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

  var exclude = context.exclude || [];

  const {
    scope,
    element
  } = context;

  const {
    parent: parentScope
  } = scope;

  const incomingSequenceFlows = filterSequenceFlows(element.incoming);

  const gatewayScopes = this._simulator.findScopes({
    parent: parentScope,
    element
  }).filter(s => !exclude.includes(s));

  const incomingFlowsWithoutToken = incomingSequenceFlows.filter(
    flow => !gatewayScopes.find(s => s.initiator.element === flow)
  );

  const incomingFlowsWithToken = incomingSequenceFlows.filter(
    flow => gatewayScopes.find(s => s.initiator.element === flow)
  );

  const remainingScopes = this._getRemainingScopes(context);

  const incomingScopes = remainingScopes.filter(
    scope => incomingFlowsWithoutToken.some(
      flow => this._canReachElement(context, scope.element, flow)
    )
  );

  const requiredScopes = incomingScopes.filter(
    scope => !incomingFlowsWithToken.some(
      flow => this._canReachElement(context, scope.element, flow)
    )
  );

  if (!requiredScopes.length) {
    this._join(context, incomingFlowsWithToken, gatewayScopes, exclude);
  }

  const remainingReceivedScopes = this._simulator.findScopes({
    parent: parentScope,
    element
  }).filter(s => !exclude.includes(s));

  // only subscribe to changes with the first
  // element scope; prevent unneeded computation
  if (remainingReceivedScopes[0] !== scope) {
    return;
  }

  const event = this._simulator.waitForScopes(scope, requiredScopes);

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

/**
 * Activates the inclusive gateway join.
 *
 * @param {object} context
 * @param {object[]} incomingFlowsWithToken
 * @param {object[]} gatewayScopes
 * @param {object[]} exclude
 *
 * @return {object[]} scopes
 */
InclusiveGatewayBehavior.prototype._join = function(context, incomingFlowsWithToken, gatewayScopes, exclude) {

  const {
    scope
  } = context;

  // only consume one token per flow
  const consumeScopes = incomingFlowsWithToken.map(
    flow => gatewayScopes.find(s => s.initiator.element === flow)
  );

  for (const childScope of consumeScopes) {

    if (childScope !== scope) {

      // complete joining child scope
      this._simulator.destroyScope(childScope.complete(), scope);
    }
  }

  this._simulator.exit(context);

  // the current scope is still running, but has already
  // participated in joining
  exclude.push(scope);

  const stayingScopes = gatewayScopes.filter(
    s => !consumeScopes.includes(s)
  );

  if (stayingScopes.length) {
    this._tryJoin({
      initiator: stayingScopes[0].initiator,
      element: stayingScopes[0].element,
      scope: stayingScopes[0],
      exclude
    });
  }
};

/**
 * Return true if the target element can be reached
 * from the current element, searching the execution
 * graph backwards.
 *
 * @param {object[]} context
 * @param {object} targetElement
 * @param {object} currentElement
 * @param {Set<object>} traversed
 *
 * @return {boolean}
 */
InclusiveGatewayBehavior.prototype._canReachElement = function(context, targetElement, currentElement, traversed = new Set()) {

  // do not visit the gateway
  if (context.element === currentElement) {
    return false;
  }

  // avoid infinite recursion
  if (traversed.has(currentElement)) {
    return false;
  }

  traversed.add(currentElement);

  if (targetElement === currentElement) {
    return true;
  }

  if (isSequenceFlow(currentElement)) {
    return this._canReachElement(context, targetElement, currentElement.source, traversed);
  }

  if (isLinkCatch(currentElement)) {
    const linkThrowEvents = filterLinkThrowEvents(
      currentElement.parent.children,
      getLinkName(currentElement)
    );

    return linkThrowEvents.some(
      linkThrowEvent => this._canReachElement(context, targetElement, linkThrowEvent, traversed)
    );
  }

  const incomingFlows = filterSequenceFlows(currentElement.incoming);

  return incomingFlows.some(
    flow => this._canReachElement(context, targetElement, flow, traversed)
  );
};


// helpers ///////////////

function getLinkName(element) {
  return getEventDefinition(element, 'bpmn:LinkEventDefinition').name;
}

function filterLinkThrowEvents(elements, linkName) {
  return elements.filter(
    e => isLinkThrow(e) && getLinkName(e) === linkName
  );
}

InclusiveGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];