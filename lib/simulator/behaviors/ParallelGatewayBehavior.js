import {
  filterSequenceFlows
} from '../util/ModelUtil';


export default function ParallelGatewayBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:ParallelGateway', this);
}

ParallelGatewayBehavior.prototype.enter = function(context) {

  const {
    scope
  } = context;

  const joiningScopes = this._findJoiningScopes(context);

  if (joiningScopes.length) {

    for (const childScope of joiningScopes) {

      if (childScope !== scope) {

        // complete joining child scope
        this._simulator.destroyScope(childScope.complete(), scope);
      }
    }

    this._simulator.exit(context);
  }
};

/**
 * Find scopes that will be joined by this transition.
 *
 * @param {Object} enterContext
 * @return {Scope[]} scopes joined by this transition
 */
ParallelGatewayBehavior.prototype._findJoiningScopes = function(enterContext) {

  const {
    scope,
    element
  } = enterContext;

  const sequenceFlows = filterSequenceFlows(element.incoming);

  const {
    parent: parentScope
  } = scope;

  const elementScopes = this._simulator.findScopes({
    parent: parentScope,
    element: element
  });

  const matchingScopes = sequenceFlows
    .map(
      flow => elementScopes
        .find(scope => scope.initiator.element === flow)
    )
    .filter(scope => scope);

  if (matchingScopes.length === sequenceFlows.length) {
    return matchingScopes;
  } else {
    return [];
  }
};

ParallelGatewayBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ParallelGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];