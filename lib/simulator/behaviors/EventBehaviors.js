import {
  getEventDefinition,
  getBusinessObject,
  is,
  isTypedEvent
} from '../../util/ElementHelper';


export default function EventBehaviors(
    simulator,
    elementRegistry) {

  this._simulator = simulator;
  this._elementRegistry = elementRegistry;
}

EventBehaviors.prototype.get = function(element) {

  const behaviors = {
    'bpmn:LinkEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      const {
        parent: parentScope
      } = scope;

      const eventDefinition = getEventDefinition(element, 'bpmn:LinkEventDefinition');
      const name = eventDefinition.get('name');

      // HINT: links work only within the same process

      const triggerElements = this._elementRegistry.filter(e => {
        return (
          e.parent === element.parent &&
          is(e, 'bpmn:CatchEvent') &&
          isTypedEvent(e, 'bpmn:LinkEventDefinition') &&
          getEventDefinition(e, 'bpmn:LinkEventDefinition').get('name') === name
        );
      });

      for (const triggerElement of triggerElements) {
        this._simulator.enter({
          element: triggerElement,
          scope: parentScope
        });
      }
    }
  };

  const entry = Object.entries(behaviors).find(
    entry => isTypedEvent(element, entry[0])
  );

  return entry && entry[1];
};

EventBehaviors.$inject = [
  'simulator',
  'elementRegistry'
];