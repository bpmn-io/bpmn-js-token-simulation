'use strict';

var tokenSimulation = require('../lib/viewer');

var BpmnViewer = require('bpmn-js/lib/NavigatedViewer');

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

viewer.importXML(exampleXML, function(err) {
  if (!err) {
    viewer.get('canvas').zoom('fit-viewport');
  } else {
    console.log('something went wrong:', err);
  }
});

window.viewer = viewer;