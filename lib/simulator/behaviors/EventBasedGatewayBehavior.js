import { isAny } from '../util/ModelUtil';


export default function EventBasedGatewayBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:EventBasedGateway', this);
}

EventBasedGatewayBehavior.$inject = [
  'simulator'
];

EventBasedGatewayBehavior.prototype.enter = function(context) {

  const {
    element,
    scope
  } = context;

  const parentScope = scope.parent;

  const triggerElements = getTriggers(element);

  // create subscriptions for outgoing event triggers
  // do nothing else beyond that
  const subscriptions = triggerElements.map(
    triggerElement => this._simulator.subscribe(parentScope, triggerElement, initiator => {

      // cancel all subscriptions
      subscriptions.forEach(subscription => subscription.remove());

      // destroy this scope
      this._simulator.destroyScope(scope, initiator);

      // signal triggered event
      return this._simulator.signal({
        element: triggerElement,
        parentScope,
        initiator
      });
    })
  );

};


// helpers ////////////////

function getTriggers(element) {
  return element.outgoing.map(
    outgoing => outgoing.target
  ).filter(activity => isAny(activity, [
    'bpmn:IntermediateCatchEvent',
    'bpmn:ReceiveTask'
  ]));
}