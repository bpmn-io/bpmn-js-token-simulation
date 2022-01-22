import {
  is
} from '../util/ModelUtil';


export default function IntermediateCatchEventBehavior(
    simulator,
    activityBehavior) {

  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
  simulator.registerBehavior('bpmn:ReceiveTask', this);
}

IntermediateCatchEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];

IntermediateCatchEventBehavior.prototype.signal = function(context) {

  const {
    element
  } = context;

  // for receive tasks adapt standard message handling
  if (is(element, 'bpmn:ReceiveTask')) {
    return this._activityBehavior.signal(context);
  }

  return this._simulator.exit(context);
};

IntermediateCatchEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  // for receive tasks, try to adapt standard activity message handling
  if (is(element, 'bpmn:ReceiveTask')) {
    const event = this._activityBehavior._triggerMessages(context);

    if (event) {
      return this._activityBehavior.signalOnEvent(context, event);
    }
  }

  // adapt special wait semantics; user must manually
  // trigger to indicate message received
  return this._activityBehavior.signalOnEvent(context, element);
};

IntermediateCatchEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};