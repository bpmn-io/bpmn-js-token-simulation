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