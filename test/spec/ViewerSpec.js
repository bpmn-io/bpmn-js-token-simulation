import TokenSimulationViewerModules from 'lib/viewer';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('viewer extension', function() {

  describe('basic', function() {

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

      // and do it again!
      toggleMode.toggleMode();
    }));

  });


  describe('all-elements', function() {

    const diagram = require('./all-elements.bpmn');

    beforeEach(bootstrapViewer(diagram, {
      additionalModules: [
        ...NavigatedViewer.prototype._modules,
        TokenSimulationViewerModules
      ]
    }));


    it('should mark unsupported', inject(function(toggleMode, elementSupport) {

      // given
      toggleMode.toggleMode();

      // then
      expect(
        elementSupport.getUnsupportedElements()
      ).to.have.length(2);
    }));

  });

});