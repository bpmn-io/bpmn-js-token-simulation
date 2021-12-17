import TokenSimulationModelerModules from '../..';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject,
  injectStyles,
  getBpmnJS
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


  describe('colors', function() {

    const diagram = require('./colors.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ...Modeler.prototype._modules,
        TokenSimulationModelerModules
      ]
    }));


    function expectColors(elementId, expectedColors) {

      return getBpmnJS().invoke(function(elementRegistry, elementColors) {
        const element = elementRegistry.get(elementId);

        expect(element).to.exist;

        const colors = elementColors.get(element);

        expect(colors).to.eql(expectedColors);
      });

    }


    it('should set (and reset) colors', inject(
      function(toggleMode, elementRegistry, elementColors) {

        // assume
        expectColors('SequenceFlow_2', { fill: undefined, stroke: '#1e88e5' });
        expectColors('StartEvent_1', { fill: '#ffcdd2', stroke: '#e53935' });
        expectColors('StartEvent_1_label', { stroke: '#e53935' });

        // when
        toggleMode.toggleMode();

        // then
        expectColors('SequenceFlow_2', { fill: undefined, stroke: '#212121' });
        expectColors('StartEvent_1', { fill: '#fff', stroke: '#000' });
        expectColors('StartEvent_1_label', { stroke: '#000' });

        // but when
        // reset
        toggleMode.toggleMode();

        // then
        expectColors('SequenceFlow_2', { fill: undefined, stroke: '#1e88e5' });
        expectColors('StartEvent_1', { fill: '#ffcdd2', stroke: '#e53935' });
        expectColors('StartEvent_1_label', { stroke: '#e53935' });

      }
    ));

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