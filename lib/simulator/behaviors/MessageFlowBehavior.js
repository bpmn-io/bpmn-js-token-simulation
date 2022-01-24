import {
  isCatchEvent
} from '../util/ModelUtil';


export default function MessageFlowBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:MessageFlow', this);
}

MessageFlowBehavior.$inject = [ 'simulator' ];

MessageFlowBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

MessageFlowBehavior.prototype.exit = function(context) {
  const {
    element,
    scope: initiator
  } = context;

  const target = element.target;

  // the event triggered is either the message event
  // represented by the target message start or catch event _or_
  // an event that uses { name: messageFlow.id } as an identifier
  const event = isCatchEvent(target) ? target : {
    type: 'message',
    element,
    name: element.id
  };

  const subscription = this._simulator.findSubscription({
    event,
    elements: [ target, target.parent ]
  });

  if (subscription) {
    this._simulator.trigger({
      event,
      initiator,
      scope: subscription.scope
    });
  }
};