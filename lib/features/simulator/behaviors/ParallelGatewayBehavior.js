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

  if (scope.getTokensByElement(element) === element.incoming.length) {
    this._simulator.exit(context);
  }
};

ParallelGatewayBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

ParallelGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];