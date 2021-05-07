'use strict';

const tokenSimulationModule = require('../lib/viewer');

const BpmnViewer = require('bpmn-js/lib/NavigatedViewer').default;

import exampleXML from './resources/example.bpmn';

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    tokenSimulationModule
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
  })
  .catch(err => {
    console.error(err);
  });

window.viewer = viewer;