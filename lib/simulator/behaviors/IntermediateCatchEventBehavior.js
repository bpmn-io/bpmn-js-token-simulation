import {
  isLink,
  is
} from './ModelUtil';


export default function IntermediateCatchEventBehavior(
    simulator,
    activityBehavior) {

  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
  simulator.registerBehavior('bpmn:ReceiveTask', this);
}

IntermediateCatchEventBehavior.prototype.signal = function(context) {

  const {
    relatedElement,
    scope
  } = context;

  const triggerEventBased = relatedElement && is(relatedElement, 'bpmn:EventBasedGateway');

  if (triggerEventBased) {
    scope.updateTokens(relatedElement, -1);
  }

  const signal = !triggerEventBased;

  this._simulator.exit({
    ...context,
    signal
  });
};

IntermediateCatchEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  if (isLink(element)) {
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