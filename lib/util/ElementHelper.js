'use strict';

var find = require('min-dash').find,
    some = require('min-dash').some;

module.exports.is = function(element, types) {
  if (element.type === 'label') {
    return;
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
};

module.exports.getEventDefinition = function(event, eventDefinitionType) {
  return find(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
};

module.exports.isTypedEvent = function(event, eventDefinitionType) {
  return some(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
};

function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

module.exports.getBusinessObject = getBusinessObject;

function isAncestor(ancestor, descendant) {
  var childParent = descendant.parent;

  while (childParent) {
    if (childParent === ancestor) {
      return true;
    }

    childParent = childParent.parent;
  }

  return false;
}

module.exports.isAncestor = isAncestor;

module.exports.getDescendants = function(elements, ancestor) {
  return elements.filter(function(element) {
    return isAncestor(ancestor, element);
  });
};

module.exports.supportedElements = [
  'bpmn:Association',
  'bpmn:BoundaryEvent',
  'bpmn:BusinessRuleTask',
  'bpmn:CallActivity',
  'bpmn:DataInputAssociation',
  'bpmn:DataObjectReference',
  'bpmn:DataOutputAssociation',
  'bpmn:DataStoreReference',
  'bpmn:EndEvent',
  'bpmn:EventBasedGateway',
  'bpmn:ExclusiveGateway',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
  'bpmn:ManualTask',
  'bpmn:ParallelGateway',
  'bpmn:Process',
  'bpmn:ScriptTask',
  'bpmn:SendTask',
  'bpmn:ReceiveTask',
  'bpmn:SequenceFlow',
  'bpmn:ServiceTask',
  'bpmn:StartEvent',
  'bpmn:SubProcess',
  'bpmn:Task',
  'bpmn:TextAnnotation',
  'bpmn:UserTask'
];