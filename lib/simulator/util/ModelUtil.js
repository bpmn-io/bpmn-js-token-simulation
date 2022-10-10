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

export function isTypedEvent(event, eventDefinitionType) {
  return some(getBusinessObject(event).eventDefinitions, definition => {
    return is(definition, eventDefinitionType);
  });
}
