import {
  is
} from '../../../util/ElementHelper';


export default function ExclusiveGatewayBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:ExclusiveGateway', this);
}

ExclusiveGatewayBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

ExclusiveGatewayBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  // depends on UI to properly configure activeOutgoing for
  // each exclusive gateway

  const config = this._simulator.getConfig(element);

  const activeOutgoing = config && config.activeOutgoing;

  for (const outgoing of element.outgoing) {
    if (outgoing === activeOutgoing) {
      this._simulator.enter({
        element: outgoing,
        scope
      });
    }
  }
};

ExclusiveGatewayBehavior.$inject = [ 'simulator' ];