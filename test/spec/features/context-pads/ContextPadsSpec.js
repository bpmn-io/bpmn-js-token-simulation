import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler as _bootstrapModeler,
  inject,
  getBpmnJS,
} from 'test/TestHelper';


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


describe('features/context-pads', function() {

  const diagram = require('./ContextPads.scope-filter.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation();
  }));


  it('should allow to start process', inject(
    async function() {

      // then
      expect(canTriggerElement('START')).to.be.true;
    }
  ));


  it('should allow to pause activities', inject(
    async function() {

      // then
      expect(canTriggerElement('NESTED_TASK')).to.be.true;
      expect(canTriggerElement('SUB_PROCESS')).to.be.true;
    }
  ));


  it('should filter scoped', inject(
    async function(scopeFilter) {

      // given
      // toggle pause
      triggerElement('NESTED_TASK');

      // start element
      triggerElement('START');

      // when
      const { scope } = await elementEnter('NESTED_TASK');

      scopeFilter.toggle(scope);

      // then
      expect(canTriggerElement('START')).to.be.false;
    }
  ));


  it('should allow trigger in simulation mode only', inject(
    async function(simulationSupport) {

      // when
      simulationSupport.toggleSimulation();

      // then
      expect(canTriggerElement('START')).to.be.false;
    }
  ));

});


describe('features/context-pads - collapsed subprocess', function() {

  const diagram = require('./ContextPads.collapsed.subprocess.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation();
  }));


  it('should allow to pause subprocess', inject(
    async function() {

      // then
      expect(canTriggerElement('CollapsedSubprocess')).to.be.true;
    }
  ));


  it('should not allow to pause subprocess plane', inject(
    async function(canvas) {

      // given
      const subprocess = canvas.findRoot('CollapsedSubprocess_plane');

      // when
      canvas.setRootElement(subprocess);

      // then
      expect(canTriggerElement('CollapsedSubprocess_plane')).to.be.false;
    }
  ));


  it('should allow to pause visible activities', inject(
    async function(canvas) {

      // given
      const process = canvas.findRoot('MainProcess');
      const subprocess = canvas.findRoot('CollapsedSubprocess_plane');

      // then
      expect(process).to.exist;
      expect(subprocess).to.exist;
      expect(canTriggerElement('Inner_Task')).to.be.false;

      // but when
      canvas.setRootElement(subprocess);

      // then
      expect(canTriggerElement('Inner_Task')).to.be.true;
    }
  ));

});


// helpers ////////////////////

function getSimulationSupport() {
  return getBpmnJS().get('simulationSupport');
}

function canTriggerElement(...args) {
  return !!getSimulationSupport().getElementTrigger(...args);
}

function triggerElement(...args) {
  return getSimulationSupport().triggerElement(...args);
}

function elementEnter(...args) {
  return getSimulationSupport().elementEnter(...args);
}
