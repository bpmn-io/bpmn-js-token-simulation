import {
  filterSequenceFlows
} from './ModelUtil';


export default function ParallelGatewayBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:ParallelGateway', this);
}

ParallelGatewayBehavior.prototype.enter = function(context) {

  const {
    scope,
    element
  } = context;

  const sequenceFlows = filterSequenceFlows(element.incoming);

  const {
    parent: parentScope
  } = scope;

  const elementScopes = parentScope.children.filter(c => c.element === element);

  if (elementScopes.length === sequenceFlows.length) {

    for (const childScope of elementScopes) {

      if (childScope !== scope) {
        this._simulator.destroyScope(childScope, {
          scope,
          element,
          reason: 'join'
        });
      }
    }

    this._simulator.exit(context);
  }
};

ParallelGatewayBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ParallelGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];