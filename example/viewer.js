'use strict';

var fs = require('fs');
var tokenSimulation = require('../lib/viewer');

var exampleXML = fs.readFileSync(__dirname + '/resources/example.bpmn', 'utf-8');
var BpmnViewer = require('bpmn-js/lib/NavigatedViewer');

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