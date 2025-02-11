import {
  find,
  some
} from 'min-dash';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

export function getEventDefinition(event, eventDefinitionType) {
  return find(getBusinessObject(event).eventDefinitions, definition => {
    return is(definition, eventDefinitionType);
  });
}

export function isTypedEvent(event, eventDefinitionType) {
  return some(getBusinessObject(event).eventDefinitions, definition => {
    return is(definition, eventDefinitionType);
  });
}