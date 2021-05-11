'use strict';

const tokenSimulationModule = require('../lib/modeler');

const BpmnModeler = require('bpmn-js/lib/Modeler').default;

import exampleXML from './resources/example.bpmn';

const persistent = new URL(window.location.href).searchParams.has('p');

function diagram() {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
}

const persistModule = persistent ? {
  __init__: [
    function(eventBus, bpmnjs) {
      eventBus.on('commandStack.changed', function() {
        bpmnjs.saveXML().then(result => {
          localStorage['diagram-xml'] = result.xml;
        });
      });
    }
  ]
} : {};

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    tokenSimulationModule,
    persistModule
  ],
  keyboard: {
    bindTo: document
  }
});

modeler.importXML(diagram())
  .then(({ warnings }) => {
    if (warnings.length) {
      console.warn(warnings);
    }

    modeler.get('canvas').zoom('fit-viewport');
  })
  .catch(err => {
    console.error(err);
  });

window.modeler = modeler;