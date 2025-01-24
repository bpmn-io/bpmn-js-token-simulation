import TokenSimulationModelerModules from '../..';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject,
  injectStyles,
  getBpmnJS
} from 'test/TestHelper';

import { matchPattern } from 'min-dash';

import { queryAll as domQueryAll } from 'min-dom';


injectStyles();

var singleStart = window.__env__ && window.__env__.SINGLE_START === 'modeler';

describe('modeler extension', function() {

  describe('basic', function() {

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
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
        TokenSimulationModelerModules
      ]
    }));

    function expectColors(elementId, expectedColors) {
      return getBpmnJS().invoke(function(elementRegistry, elementColors) {
        const element = elementRegistry.get(elementId);

        expect(element).to.exist;

        const colors = elementColors._get(element);

        expect(colors).to.eql(expectedColors);
      });
    }


    it('should set (and reset) colors when toggling', inject(function(toggleMode) {

      // assume
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#1e88e5' });
      expectColors('StartEvent_1', { fill: '#ffcdd2', stroke: '#e53935' });
      expectColors('StartEvent_1_label', { stroke: '#e53935' });

      // when
      toggleMode.toggleMode();

      // then
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#212121' });
      expectColors('StartEvent_1', { fill: '#fff', stroke: '#212121' });
      expectColors('StartEvent_1_label', { stroke: '#212121' });

      // but when
      // reset
      toggleMode.toggleMode();

      // then
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#1e88e5' });
      expectColors('StartEvent_1', { fill: '#ffcdd2', stroke: '#e53935' });
      expectColors('StartEvent_1_label', { stroke: '#e53935' });

    }));


    it('should reset colors before export', inject(async function(bpmnjs, eventBus, toggleMode) {

      // given
      toggleMode.toggleMode();

      // assume
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#212121' });
      expectColors('StartEvent_1', { fill: '#fff', stroke: '#212121' });
      expectColors('StartEvent_1_label', { stroke: '#212121' });

      const saveXMLSpy = sinon.spy(({ definitions }) => {

        // then
        const diagrams = definitions.get('diagrams'),
              plane = diagrams[ 0 ].get('plane'),
              planeElement = plane.get('planeElement');

        expect(planeElement.find(matchPattern({ id: 'SequenceFlow_2_di' })).get('border-color')).to.equal('#1e88e5');
        expect(planeElement.find(matchPattern({ id: 'StartEvent_1_di' })).get('background-color')).to.equal('#ffcdd2');
        expect(planeElement.find(matchPattern({ id: 'StartEvent_1_di' })).get('border-color')).to.equal('#e53935');
        expect(planeElement.find(matchPattern({ id: 'StartEvent_1_di' })).get('label').get('color')).to.equal('#e53935');

        expect(plane.$attrs).to.be.empty;
      });

      eventBus.on('saveXML.start', 500, saveXMLSpy);

      // when
      await bpmnjs.saveXML({ format: true });

      expect(saveXMLSpy).to.have.been.calledOnce;
    }));


    it('should set colors after export', inject(async function(bpmnjs, eventBus, toggleMode) {

      // given
      toggleMode.toggleMode();

      // assume
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#212121' });
      expectColors('StartEvent_1', { fill: '#fff', stroke: '#212121' });
      expectColors('StartEvent_1_label', { stroke: '#212121' });

      const saveXMLSpy = sinon.spy(({ definitions }) => {

        // assume
        const diagrams = definitions.get('diagrams'),
              plane = diagrams[ 0 ].get('plane');

        expect(plane.$attrs).to.be.empty;
      });

      eventBus.on('saveXML.start', 500, saveXMLSpy);

      // when
      await bpmnjs.saveXML({ format: true });

      expect(saveXMLSpy).to.have.been.calledOnce;

      // then
      expectColors('SequenceFlow_2', { fill: undefined, stroke: '#212121' });
      expectColors('StartEvent_1', { fill: '#fff', stroke: '#212121' });
      expectColors('StartEvent_1_label', { stroke: '#212121' });
    }));


    it('should not set colors on elements that do not support them', inject(async function(bpmnjs, toggleMode) {

      // when
      toggleMode.toggleMode();

      // then
      const definitions = bpmnjs.getDefinitions(),
            diagrams = definitions.get('diagrams'),
            plane = diagrams[ 0 ].get('plane');

      expect(plane.$attrs).to.be.empty;
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
      ).to.have.length(1);
    }));

  });


  describe('UI', function() {

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        TokenSimulationModelerModules
      ]
    }));


    it('should hide UI', inject(function(canvas, toggleMode) {

      // given
      const ui = domQueryAll(`
        .djs-bendpoint,
        .djs-context-pad,
        .djs-outline,
        .djs-palette,
        .djs-resizer,
        .djs-segment-dragger
      `, canvas.getContainer());

      Array.from(ui).forEach(element => {
        expect(window.getComputedStyle(element).display !== 'none').to.be.true;
      });

      // when
      toggleMode.toggleMode();

      // then
      Array.from(ui).forEach(element => {
        expect(window.getComputedStyle(element).display === 'none').to.be.true;
      });
    }));

  });


  describe('overlays', function() {

    class FoobarOverlays {
      constructor(eventBus, overlays) {
        eventBus.on('shape.added', ({ element }) => {
          overlays.add(element, 'foobar', {
            html: '<h1>Foobar</h1>',
            position: {
              bottom: 0,
              left: 0
            }
          });
        });
      }
    }

    FoobarOverlays.$inject = [ 'eventBus', 'overlays' ];

    const FoobarOverlaysModule = {
      __init__: [ 'foobarOverlays' ],
      foobarOverlays: [ 'type', FoobarOverlays ]
    };

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        TokenSimulationModelerModules,
        FoobarOverlaysModule
      ]
    }));


    it('should hide overlays', inject(function(toggleMode) {

      // given
      const overlays = Array.from(domQueryAll('.djs-overlay-foobar'));

      expect(overlays).to.have.length.greaterThan(0);
      expect(overlays.every(element => window.getComputedStyle(element).display !== 'none')).to.be.true;

      // when
      toggleMode.toggleMode();

      // then
      expect(overlays.every(element => window.getComputedStyle(element).display === 'none')).to.be.true;
    }));


    it('should not hide drilldown', inject(function(bpmnReplace, elementRegistry, toggleMode) {

      // given
      const task = elementRegistry.get('Task_3');
      bpmnReplace.replaceElement(task, { type: 'bpmn:SubProcess', isExpanded: false });

      const overlays = Array.from(domQueryAll('.djs-overlay-drilldown'));

      expect(overlays).to.have.length.greaterThan(0);
      expect(overlays.every(element => window.getComputedStyle(element).display !== 'none')).to.be.true;

      // when
      toggleMode.toggleMode();

      // then
      expect(overlays.every(element => window.getComputedStyle(element).display !== 'none')).to.be.true;
    }));

  });

});