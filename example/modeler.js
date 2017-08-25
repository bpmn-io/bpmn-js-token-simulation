'use strict';

var fs = require('fs');
var tokenSimulation = require('../lib/modeler');

var exampleXML = fs.readFileSync(__dirname + '/resources/example.bpmn', 'utf-8');
var BpmnModeler = require('bpmn-js/lib/Modeler');

var modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    tokenSimulation
  ],
  keyboard: {
    bindTo: document
  }
});

modeler.importXML(exampleXML, function(err) {
  if (!err) {
    modeler.get('canvas').zoom('fit-viewport');
  } else {
    console.log('something went wrong:', err);
  }
});

window.modeler = modeler;
