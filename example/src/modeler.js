import TokenSimulationModule from '../../lib/modeler';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import fileDrop from 'file-drops';

import exampleXML from '../resources/example.bpmn';


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
    TokenSimulationModule,
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

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', function(files) {

  // files = [ { name, contents }, ... ]

  const file = files[0];

  file && modeler.importXML(file.contents)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      modeler.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });

}), false);