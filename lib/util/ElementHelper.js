import {
  find,
  some
} from 'min-dash';

import {
  is as __is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

export function is(element, types) {
  if (element.type === 'label') {
    return false;
  }

  if (!Array.isArray(types)) {
    types = [ types ];
  }

  return types.some(function(type) {
    return __is(element, type);
  });
}

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

export {
  getBusinessObject
};