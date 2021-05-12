import TokenSimulationModule from '../../lib/viewer';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import fileDrop from 'file-drops';

import exampleXML from '../resources/example.bpmn';


const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    TokenSimulationModule
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


document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', function(files) {

  // files = [ { name, contents }, ... ]

  const file = files[0];

  file && viewer.importXML(file.contents)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      viewer.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });

}), false);