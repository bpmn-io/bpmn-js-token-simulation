export default function EndEventBehavior(
    simulator,
    scopeBehavior,
    intermediateThrowEventBehavior) {

  this._intermediateThrowEventBehavior = intermediateThrowEventBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:EndEvent', this);
}

EndEventBehavior.$inject = [
  'simulator',
  'scopeBehavior',
  'intermediateThrowEventBehavior'
];

EndEventBehavior.prototype.enter = function(context) {
  this._intermediateThrowEventBehavior.enter(context);
};

EndEventBehavior.prototype.signal = function(context) {
  this._intermediateThrowEventBehavior.signal(context);
};

EndEventBehavior.prototype.exit = function(context) {

  const {
    scope
  } = context;

  this._scopeBehavior.tryExit(scope.parent, scope);
};