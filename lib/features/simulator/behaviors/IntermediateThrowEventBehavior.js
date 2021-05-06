import {
  getEventDefinition,
  is,
  isTypedEvent
} from '../../../util/ElementHelper';

export default function IntermediateThrowEventBehavior(
    elementRegistry,
    simulator,
    activityBehavior) {

  this._elementRegistry = elementRegistry;
  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateThrowEvent', this);
}

IntermediateThrowEventBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

IntermediateThrowEventBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

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
  } else {

    return this._activityBehavior.exit(context);
  }
};

IntermediateThrowEventBehavior.$inject = [
  'elementRegistry',
  'simulator',
  'activityBehavior'
];