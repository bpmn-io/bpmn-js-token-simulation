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

  if (scope.getTokensByElement(element) === sequenceFlows.length) {
    this._simulator.exit({
      joins: sequenceFlows.length,
      ...context
    });
  }
};

ParallelGatewayBehavior.prototype.exit = function(context) {

  const {
    joins
  } = context;

  const tokens = this._activityBehavior.exit(context) || 1;

  return joins + tokens - 1;
};

ParallelGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];