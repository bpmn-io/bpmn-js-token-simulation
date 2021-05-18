export default function IntermediateThrowEventBehavior(
    simulator,
    activityBehavior,
    eventBehaviors) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._eventBehaviors = eventBehaviors;

  simulator.registerBehavior('bpmn:IntermediateThrowEvent', this);
}

IntermediateThrowEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  const eventBehavior = this._eventBehaviors.get(element);

  if (eventBehavior) {
    eventBehavior(context);
  }

  this._activityBehavior.enter(context);
};

IntermediateThrowEventBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

IntermediateThrowEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'eventBehaviors'
];