'use strict';

var every = require('min-dash').every,
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

module.exports.isTypedEvent = function(event, eventDefinitionType, filter) {

  function matches(definition, filter) {
    return every(filter, function(val, key) {

      // we want a == conversion here, to be able to catch
      // undefined == false and friends
      return definition[key] == val;
    });
  }

  return some(event.eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType && matches(event, filter);
  });
};

module.exports.getBusinessObject = function(element) {
  return (element && element.businessObject) || element;
};

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
  'bpmn:ManualTask',
  'bpmn:ParallelGateway',
  'bpmn:Process',
  'bpmn:ScriptTask',
  'bpmn:SequenceFlow',
  'bpmn:ServiceTask',
  'bpmn:StartEvent',
  'bpmn:SubProcess',
  'bpmn:Task',
  'bpmn:TextAnnotation',
  'bpmn:UserTask'
];