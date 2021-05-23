export default function StartEventBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:StartEvent', this);
}

StartEventBehavior.prototype.signal = function(context) {

  const {
    parentScope
  } = context;

  if (!parentScope) {
    throw new Error('missing <parentScope>');
  }

  this._scopeBehavior.enter(context);

  this._simulator.exit(context);
};

StartEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

StartEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];