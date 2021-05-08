import TokenSimulationViewerModules from 'lib/viewer';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('token-simulation - viewer', function() {

  const diagram = require('./simple.bpmn');

  beforeEach(bootstrapViewer(diagram, {
    additionalModules: [
      ...(NavigatedViewer.prototype._modules),
      TokenSimulationViewerModules
    ]
  }));


  it('should toggle mode', inject(function(toggleMode) {

    // YEA!
    toggleMode.toggleMode();
  }));

});