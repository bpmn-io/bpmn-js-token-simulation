import {
  find,
  some
} from 'min-dash';

export function is(element, types) {
  if (element.type === 'label') {
    return false;
  }

  if (!Array.isArray(types)) {
    types = [ types ];
  }

  var isType = false;

  types.forEach(function(type) {
    if (type === element.type) {
      isType = true;
    }
  });

  return isType;
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