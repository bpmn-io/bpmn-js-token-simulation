import TokenSimulationModelerModules from '../..';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('modeler extension', function() {

  describe('basic', function() {

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ...Modeler.prototype._modules,
        TokenSimulationModelerModules
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

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ...Modeler.prototype._modules,
        TokenSimulationModelerModules
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