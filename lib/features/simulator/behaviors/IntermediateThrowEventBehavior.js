import {
  getEventDefinition,
  is,
  isTypedEvent
} from '../../../util/ElementHelper';

export default function IntermediateThrowEventBehavior(elementRegistry, simulator) {
  this._elementRegistry = elementRegistry;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateThrowEvent', this);
}

IntermediateThrowEventBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

IntermediateThrowEventBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

IntermediateThrowEventBehavior.prototype.exit = function(context) {
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

  if (isTypedEvent(element, 'bpmn:LinkEventDefinition')) {
    const name = getEventDefinition(element, 'bpmn:LinkEventDefinition').get('name');

    const linkIntermediateCatchEvents = this._elementRegistry.filter(element => {
      return is(element, 'bpmn:IntermediateCatchEvent')
        && isTypedEvent(element, 'bpmn:LinkEventDefinition')
        && getEventDefinition(element, 'bpmn:LinkEventDefinition').get('name') === name;
    });

    for (const linkIntermediateCatchEvent of linkIntermediateCatchEvents) {
      this._simulator.enter({
        element: linkIntermediateCatchEvent,
        scope
      });
    }
  }
};

IntermediateThrowEventBehavior.$inject = [ 'elementRegistry', 'simulator' ];