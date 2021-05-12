import {
  find,
  some
} from 'min-dash';

import {
  is as __is
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
  return find(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
}

export function isTypedEvent(event, eventDefinitionType) {
  return some(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
}

export function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}