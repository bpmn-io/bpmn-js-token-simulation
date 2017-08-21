'use strict';

var fs = require('fs');
var tokenSimulation = require('../lib');

var demoDiagram = fs.readFileSync(__dirname + '/resources/demo.bpmn', 'utf-8');
var BpmnModeler = require('bpmn-js/lib/Modeler');

var modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    tokenSimulation
  ]
});

modeler.importXML(demoDiagram, function(err) {
  if (!err) {
    modeler.get('canvas').zoom('fit-viewport');
  } else {
    console.log('something went wrong:', err);
  }
});
