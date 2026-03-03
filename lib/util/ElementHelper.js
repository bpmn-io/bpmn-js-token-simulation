import {
  find,
  some
} from 'min-dash';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

export function isAncestor(ancestor, descendant) {

  if (!ancestor || !descendant) {
    return false;
  }

  do {
    if (ancestor === descendant) {
      return true;
    }

    descendant = descendant.parent;
  } while (descendant);

  return false;
}

export function getElementLabel(element) {
  return getBusinessObject(element).name || element.id;
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