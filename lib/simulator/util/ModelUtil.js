import {
  getPlaneIdFromShape
} from 'bpmn-js/lib/util/DrilldownUtil';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  some
} from 'min-dash';


export { is, getBusinessObject };

export function filterSequenceFlows(flows) {
  return flows.filter(f => is(f, 'bpmn:SequenceFlow'));
}

export function isMessageFlow(element) {
  return is(element, 'bpmn:MessageFlow');
}

export function isSequenceFlow(element) {
  return is(element, 'bpmn:SequenceFlow');
}

export function isMessageCatch(element) {
  return isCatchEvent(element) && isTypedEvent(element, 'bpmn:MessageEventDefinition');
}

export function isLinkCatch(element) {
  return isCatchEvent(element) && isTypedEvent(element, 'bpmn:LinkEventDefinition');
}

export function isLinkThrow(element) {
  return is(element, 'bpmn:IntermediateThrowEvent') && isTypedEvent(element, 'bpmn:LinkEventDefinition');
}

export function isCompensationEvent(element) {
  return isCatchEvent(element) && isTypedEvent(element, 'bpmn:CompensateEventDefinition');
}

export function isCompensationActivity(element) {
  return is(element, 'bpmn:Activity') && element.businessObject.isForCompensation;
}

export function isCatchEvent(element) {
  return (
    is(element, 'bpmn:CatchEvent') ||
    is(element, 'bpmn:ReceiveTask')
  ) && !isLabel(element);
}

export function isBoundaryEvent(element) {
  return is(element, 'bpmn:BoundaryEvent') && !isLabel(element);
}

export function isNoneStartEvent(element) {
  return isStartEvent(element) && !isTypedEvent(element);
}

export function isImplicitStartEvent(element) {
  if (isLabel(element)) {
    return false;
  }

  if (!isAny(element, [
    'bpmn:Activity',
    'bpmn:IntermediateCatchEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:Gateway',
    'bpmn:EndEvent'
  ])) {
    return false;
  }

  if (isLinkCatch(element)) {
    return false;
  }

  const incoming = element.incoming.find(isSequenceFlow);

  if (incoming) {
    return false;
  }

  if (isCompensationActivity(element)) {
    return false;
  }

  if (isEventSubProcess(element)) {
    return false;
  }

  return true;
}

export function isStartEvent(element) {
  return is(element, 'bpmn:StartEvent') && !isLabel(element);
}

export function isLabel(element) {
  return !!element.labelTarget;
}

export function isEventSubProcess(element) {
  return getBusinessObject(element).triggeredByEvent;
}

export function isInterrupting(element) {
  return (
    is(element, 'bpmn:StartEvent') && getBusinessObject(element).isInterrupting
  ) || (
    is(element, 'bpmn:BoundaryEvent') && getBusinessObject(element).cancelActivity
  );
}

export function isAny(element, types) {
  return types.some(type => is(element, type));
}

/**
 * @param { DiagramElement} event
 * @param {string|undefined} [eventDefinitionType]
 *
 * @return {boolean}
 */
export function isTypedEvent(event, eventDefinitionType) {
  return some(getBusinessObject(event).eventDefinitions, definition => {
    return eventDefinitionType ? is(definition, eventDefinitionType) : true;
  });
}

export function getChildren(element, elementRegistry) {
  if (element.children && element.children.length !== 0) {
    return element.children;
  }

  if (is(element, 'bpmn:SubProcess') && !element.di.isExpanded) {

    // ensure bpmn-js@9 compatibility
    //
    // sub-process may be collapsed, in this case operate on the plane
    return elementRegistry.get(getPlaneIdFromShape(element)).children;
  }

  return [];
}
