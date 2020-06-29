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

modeler.importXML(exampleXML)
  .then(({ warnings }) => {
    if (warnings.length) {
      console.warn(warnings);
    }

    modeler.get('canvas').zoom('fit-viewport');

    window.modeler = modeler;
  })
  .catch(err => {
    console.err(err);
  });