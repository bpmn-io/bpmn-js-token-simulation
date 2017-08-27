'use strict';

module.exports.is = function(element, types) {

  if (element.type === 'label') {
    return;
  }

  if (!Array.isArray(types)) {
    types = [ types ];
  }

  var isType = false;

  types.forEach(function(type) {
    var bo = element.businessObject;

    if (bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)) {
      isType = true;
    }
  });

  return isType;
};

module.exports.supportedElements = [
  'bpmn:Association',
  'bpmn:DataInputAssociation',
  'bpmn:DataOutputAssociation',
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference',
  'bpmn:EndEvent',
  'bpmn:ExclusiveGateway',
  'bpmn:IntermediateCatchEvent',
  'bpmn:ParallelGateway',
  'bpmn:SequenceFlow',
  'bpmn:StartEvent',
  'bpmn:SubProcess',
  'bpmn:Task',
  'bpmn:TextAnnotation'
];