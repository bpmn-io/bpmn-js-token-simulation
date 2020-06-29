'use strict';

var tokenSimulation = require('../lib/viewer');

var BpmnViewer = require('bpmn-js/lib/NavigatedViewer').default;

import exampleXML from './resources/example.bpmn';

var viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    tokenSimulation
  ],
  keyboard: {
    bindTo: document
  }
});

viewer.importXML(exampleXML)
  .then(({ warnings }) => {
    if (warnings.length) {
      console.warn(warnings);
    }

    viewer.get('canvas').zoom('fit-viewport');

    window.viewer = viewer;
  })
  .catch(err => {
    console.err(err);
  });