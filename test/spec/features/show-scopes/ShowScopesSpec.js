import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler as _bootstrapModeler,
  inject,
  getBpmnJS,
} from 'test/TestHelper';

import { queryAll as domQueryAll } from 'min-dom';

const TestModule = {
  __depends__: [
    SimulationSupportModule
  ],
  __init__: [
    function(animation) {
      animation.setAnimationSpeed(100);
    }
  ]
};

function bootstrapModeler(diagram, config) {
  const {
    animation = {},
    ...restConfig
  } = config;

  return _bootstrapModeler(diagram, {
    ...restConfig,
    animation: {
      randomize: false,
      ...animation
    }
  });
}


describe('features/show-scopes', function() {

  describe('process', function() {

    const diagram = require('./processes.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should show scope', inject(
      async function() {

        // when
        triggerElement('StartEvent_1');

        await elementEnter('WaitingTask_1');

        // then
        const scopeElements = getScopeElements();
        expect(scopeElements.length).equals(1);

        // but when
        triggerElement('StartEvent_2');

        await elementEnter('WaitingTask_2');

        // then
        const scopeElements2 = getScopeElements();
        expect(scopeElements2.length).equals(2);
      }
    ));

  });


  describe('sub-process', function() {

    const diagram = require('./sub-processes.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should show scopes', inject(
      async function() {

        // when
        triggerElement('StartEvent_1');

        await elementEnter('WaitingTask_1');

        // then
        const scopeElements1 = getScopeElements();
        expect(scopeElements1.length).equals(2);

        // and when
        triggerElement('WaitingTask_1');

        await elementEnter('WaitingTask_2');

        // then
        const scopeElements2 = getScopeElements();
        expect(scopeElements2.length).equals(2);

        // and when
        triggerElement('WaitingTask_2');

        await elementEnter('WaitingTask_3');

        // then
        const scopeElements3 = getScopeElements();
        expect(scopeElements3.length).equals(2);
      }
    ));

  });


  describe('event sub-process', function() {

    const diagram = require('./event-sub-processes.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should show scopes', inject(
      async function() {

        // when
        triggerElement('StartEvent_1');

        await elementEnter('WaitingTask_2');

        // then
        const scopeElements = getScopeElements();
        expect(scopeElements.length).equals(3);
      }
    ));

  });

});


// helpers ////////////////////

function getScopeElements() {
  return Array.from(domQueryAll('.bts-scopes > .bts-scope'));
}

function getSimulationSupport() {
  return getBpmnJS().get('simulationSupport');
}

function triggerElement(...args) {
  return getSimulationSupport().triggerElement(...args);
}

function elementEnter(...args) {
  return getSimulationSupport().elementEnter(...args);
}