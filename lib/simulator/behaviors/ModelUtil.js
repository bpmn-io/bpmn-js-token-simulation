import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

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

export function isTerminate(element) {
  return (getBusinessObject(element).eventDefinitions || []).find(definition => {
    return is(definition, 'bpmn:TerminateEventDefinition');
  });
}

export function isLink(element) {
  return (getBusinessObject(element).eventDefinitions || []).find(definition => {
    return is(definition, 'bpmn:LinkEventDefinition');
  });
}

export function isEventSubProcess(element) {
  return getBusinessObject(element).triggeredByEvent;
}