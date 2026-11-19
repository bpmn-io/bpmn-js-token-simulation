import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';

import SimulationSupportModule from 'lib/simulation-support';

import ModelerModule from 'lib/modeler';

import {
  bootstrapModeler as _bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';


const TestModule = {
  __depends__: [
    SimulationSupportModule
  ],
  __init__: [
    function(animation) {
      animation.setAnimationSpeed(1000);
    }
  ]
};


describe('lib/animation', function() {

  const diagram = require('./Animation.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation(true);
  }));


  it('should add animation', inject(
    async function(animation) {

      // when
      triggerElement('START');

      // then
      expect(animation._animations).not.to.be.empty;
    }
  ));


  it('should remove animation once done', inject(
    async function(animation) {

      // given
      // pause on <task>
      triggerElement('TASK');

      // start from <start event>
      triggerElement('START');

      // assume
      expect(animation._animations).not.to.be.empty;

      // when
      await elementEnter('TASK');

      // then
      expect(animation._animations).to.be.empty;
    }
  ));


  it('should clear animations on <diagram.destroy>', inject(
    async function(simulator, animation, bpmnjs) {

      // given
      triggerElement('START');

      // assume
      expect(animation._animations).not.to.be.empty;

      // when
      bpmnjs.destroy();

      // then
      expect(animation._animations).to.be.empty;
    }
  ));


  describe('compensation', function() {

    const diagram = require('./Animation.compensation.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation(true);
    }));


    it('should animate association to compensation activity', inject(
      async function(animation, elementRegistry) {

        // given
        const association = elementRegistry.get('Association_B');

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        // then
        const animatedPaths = [ ...animation._animations ].map(a => a.waypoints);

        expect(animatedPaths).to.include(association.waypoints);
      }
    ));


    it('should show neutral token on association to compensation activity', inject(
      async function(animation, elementRegistry) {

        // given
        const association = elementRegistry.get('Association_B');

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        // then
        const associationAnimation = [ ...animation._animations ].find(a => a.element === association);
        const tokenCircle = associationAnimation.gfx.querySelector('.bts-circle');

        expect(tokenCircle.getAttribute('fill')).to.eql('#999');
      }
    ));


    it('should not count token while it travels to compensation activity', inject(
      async function(overlays) {

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        // then
        expect(tokenCounts(overlays, 'COMPENSATE_B')).to.be.empty;
      }
    ));


    it('should count token once it arrived at compensation activity', inject(
      async function(overlays, animation, elementRegistry) {

        // given
        // pause on <compensation activity>
        triggerElement('COMPENSATE_B');

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        await animationDone(animation, elementRegistry.get('Association_B'));

        // then
        expect(tokenCounts(overlays, 'COMPENSATE_B')).to.have.length(1);
      }
    ));


    it('should not enter compensation activity after reset', inject(
      async function(animation, resetSimulation, simulator) {

        // given
        const exits = [];

        simulator.on('trace', event => isExitOf('COMPENSATE_B')(event) && exits.push(event));

        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        // when
        resetSimulation.resetSimulation();

        await nextTick();

        // then
        expect(animation._animations).to.be.empty;
        expect(exits).to.be.empty;
      }
    ));

  });


  describe('compensation with receive task', function() {

    const diagram = require('./Animation.compensation-receive-task.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation(true);
    }));


    it('should animate association to compensation receive task', inject(
      async function(animation, elementRegistry, overlays) {

        // given
        const association = elementRegistry.get('Association_B');

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        // then
        const animatedPaths = [ ...animation._animations ].map(a => a.waypoints);

        expect(animatedPaths).to.include(association.waypoints);
        expect(tokenCounts(overlays, 'COMPENSATE_B')).to.be.empty;
      }
    ));


    it('should wait at compensation receive task once arrived', inject(
      async function(animation, elementRegistry, overlays) {

        // when
        triggerElement('START');

        await elementEnter('COMPENSATE_B');

        await animationDone(animation, elementRegistry.get('Association_B'));

        // then
        expect(tokenCounts(overlays, 'COMPENSATE_B')).to.have.length(1);
      }
    ));

  });

});


// helpers

function getSimulationSupport() {
  return getBpmnJS().get('simulationSupport');
}

function triggerElement(...args) {
  return getSimulationSupport().triggerElement(...args);
}

function elementEnter(...args) {
  return getSimulationSupport().elementEnter(...args);
}

function tokenCounts(overlays, elementId) {
  return overlays.get({ element: elementId, type: 'bts-token-count' });
}

async function animationDone(animation, connection) {
  while ([ ...animation._animations ].some(a => a.element === connection)) {
    await nextTick();
  }
}

function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 10));
}

function isExitOf(elementId) {
  return event => event.action === 'exit' && event.element.id === elementId;
}