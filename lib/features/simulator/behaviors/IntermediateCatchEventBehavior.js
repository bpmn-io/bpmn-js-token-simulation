import {
  isTypedEvent
} from '../../../util/ElementHelper';

export default function IntermediateCatchEventBehavior(simulator) {
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
  const {
    element,
    signal,
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

  return signal ? 2 : 1;
};

IntermediateCatchEventBehavior.$inject = [ 'simulator' ];