import {
  isTypedEvent
} from '../../../util/ElementHelper';

export default function IntermediateCatchEventBehavior(
    simulator,
    activityBehavior) {

  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
}

IntermediateCatchEventBehavior.prototype.signal = function(context) {
  this._simulator.exit({
    ...context,
    signal: true
  });
};

IntermediateCatchEventBehavior.prototype.enter = function(context) {
  const { element } = context;

  if (isTypedEvent(element, 'bpmn:LinkEventDefinition')) {
    this._simulator.exit(context);
  }
};

IntermediateCatchEventBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

IntermediateCatchEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];