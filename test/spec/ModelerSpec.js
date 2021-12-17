import TokenSimulationModelerModules from '../..';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject,
  injectStyles
} from 'test/TestHelper';


injectStyles();

var singleStart = window.__env__ && window.__env__.SINGLE_START === 'modeler';


describe('modeler extension', function() {

  describe('basic', function() {

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ...Modeler.prototype._modules,
        TokenSimulationModelerModules
      ]
    }));


    (singleStart ? it.only : it)('should toggle mode', inject(function(toggleMode) {

      // YEA!
      toggleMode.toggleMode();

      // do it again!
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