export default function ParallelGatewayBehavior(simulator) {
  this._simulator = simulator;

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

  const {
    element,
    scope
  } = context;

  for (const outgoing of element.outgoing) {
    this._simulator.enter({
      element: outgoing,
      scope
    });
  }
};

ParallelGatewayBehavior.$inject = [ 'simulator' ];