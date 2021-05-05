export default function StartEventBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:StartEvent', this);
}

StartEventBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

/**
 * Start event has no incoming sequence flows.
 * Therefore it can never consume.
 */
StartEventBehavior.prototype.enter = function(context) {};

/**
 * Generate tokens for start event that was either
 * invoked by user or a parent process.
 *
 * @param {Object} context - The context.
 * @param {Object} context.element
 * @param {Object} [context.scope]
 */
StartEventBehavior.prototype.exit = function(context) {
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

StartEventBehavior.$inject = [ 'simulator' ];