export default function EventBasedGatewayBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:EventBasedGateway', this);
}

EventBasedGatewayBehavior.prototype.enter = function(context) {

  // literally do nothing, catch event behavior will unstuck us
};

EventBasedGatewayBehavior.$inject = [
  'simulator'
];