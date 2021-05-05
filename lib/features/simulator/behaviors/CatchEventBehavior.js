export default function CatchEventBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
}

CatchEventBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

CatchEventBehavior.prototype.enter = function(context) {};

CatchEventBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

  // TODO(nikku): move split behavior into shared place
  for (const outgoing of element.outgoing) {
    this._simulator.enter({
      element: outgoing,
      scope
    });
  }

  // TODO: create hook for UI elements to show context menus
};

CatchEventBehavior.$inject = [ 'simulator' ];