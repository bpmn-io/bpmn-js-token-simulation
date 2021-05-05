export default function TaskBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:Task', this);
}

TaskBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

TaskBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  // TODO(nikku): move split behavior into shared place
  for (const outgoing of element.outgoing) {
    this._simulator.enter({
      element: outgoing,
      scope
    });
  }
};

TaskBehavior.$inject = [ 'simulator' ];