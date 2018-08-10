'use strict';

var tokenSimulation = require('../lib/modeler');

var BpmnModeler = require('bpmn-js/lib/Modeler').default;

import exampleXML from './resources/example.bpmn';

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
