'use strict';

var every = require('lodash/every'),
    some = require('lodash/some');

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

function isParent(parent, child) {
  var childParent = child.parent;

  while (childParent) {
    if (childParent === parent) {
      return true;
    }

    childParent = childParent.parent;
  }

  return false;
}

module.exports.isParent = isParent;

module.exports.getElementsInScope = function(elements, scope) {
  return elements.filter(function(element) {
    return isParent(scope, element);
  });
};

module.exports.supportedElements = [
  'bpmn:Association',
  'bpmn:BusinessRuleTask',
  'bpmn:DataInputAssociation',
  'bpmn:DataOutputAssociation',
  'bpmn:DataObjectReference',
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