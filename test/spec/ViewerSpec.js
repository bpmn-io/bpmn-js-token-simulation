import TokenSimulationViewerModules from 'lib/viewer';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('token-simulation - viewer', function() {

  const diagram = require('example/resources/example.bpmn');

  beforeEach(bootstrapViewer(diagram, {
    additionalModules: [].concat(NavigatedViewer.prototype._modules).concat([
      TokenSimulationViewerModules
    ]),
    keyboard: {
      bindTo: document
    }
  }));


  it('should toggle mode', inject(function(toggleMode) {

    // YEA!
    toggleMode.toggleMode();
  }));

});