import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler as _bootstrapModeler,
  inject,
  getBpmnJS,
  withBpmnJs,
} from 'test/TestHelper';

import { expect } from 'chai';

import { getBBox } from 'diagram-js/lib/util/Elements';


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


describe('features/context-pads - keyboard and focus', function() {

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


  withBpmnJs('>= 18')('should focus canvas after click on context pad button', inject(
    function(canvas, simulationSupport) {

      // given
      const trigger = simulationSupport.getElementTrigger('START');
      expect(trigger).to.exist;

      // when
      simulationSupport.triggerElement('START');

      // then
      expect(canvas.isFocused()).to.be.true;
    }
  ));


  withBpmnJs('>= 18')('should keep button focused when activated via Space key', inject(
    function(canvas, simulationSupport) {

      // given
      const trigger = simulationSupport.getElementTrigger('START');
      trigger.focus();

      // when
      trigger.dispatchEvent(new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      }));

      // then
      expect(document.activeElement).to.equal(trigger);
      expect(canvas.isFocused()).to.be.false;
    }
  ));


  withBpmnJs('>= 18')('should keep button focused when activated via Enter key', inject(
    function(canvas, simulationSupport) {

      // given
      const trigger = simulationSupport.getElementTrigger('START');
      trigger.focus();

      // when
      trigger.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      }));

      // then
      expect(document.activeElement).to.equal(trigger);
      expect(canvas.isFocused()).to.be.false;
    }
  ));


  withBpmnJs('>= 18')('should not trigger action on non-matching key', inject(
    function(simulationSupport) {

      // given
      const trigger = simulationSupport.getElementTrigger('START');
      trigger.focus();

      // when
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });

      trigger.dispatchEvent(event);

      // then
      expect(event.defaultPrevented).to.be.false;
    }
  ));

});


describe('features/context-pads - inclusive gateway', function() {

  const diagram = require('./ContextPads.inclusive-gateway.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation();
  }));


  it('should not stack toggle pads of flows sharing a trunk', inject(
    function() {

      // when
      const pads = [ 'FLOW_A', 'FLOW_B', 'FLOW_C' ].map(getPadCenter);

      // then
      expectApart(pads);
    }
  ));


  it('should place toggle pads where flows leave the trunk', inject(
    function() {

      // when
      const padA = getPadCenter('FLOW_A');
      const padB = getPadCenter('FLOW_B');
      const padC = getPadCenter('FLOW_C');

      // then
      // FLOW_A and FLOW_B branch off the trunk (x = 275) to the right ...
      expect(padA.y).to.eql(200);
      expect(padA.x).to.be.above(275);

      expect(padB.y).to.eql(320);
      expect(padB.x).to.be.above(275);

      // ... while FLOW_C has the trunk to itself below the turn of FLOW_B
      expect(padC.x).to.eql(275);
      expect(padC.y).to.be.above(320);
    }
  ));


  it('should stagger toggle pads of overlapping flows', inject(
    function() {

      // when
      const pads = [ 'FLOW_D', 'FLOW_E' ].map(getPadCenter);

      // then
      expectApart(pads);

      pads.forEach(pad => expect(pad.y).to.eql(625));
    }
  ));

});


// helpers ////////////////////

// context pads are buttons of this size, centered on their anchor
const PAD_SIZE = 30;

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

function getPadCenter(flowId) {
  const bpmnjs = getBpmnJS();

  const flow = bpmnjs.get('elementRegistry').get(flowId);

  const pads = bpmnjs.get('overlays').get({
    element: flow,
    type: 'bts-context-menu'
  });

  expect(pads).to.have.length(1);

  const bbox = getBBox(flow);

  const {
    left,
    top
  } = pads[0].position;

  return {
    x: Math.round(bbox.x + left + PAD_SIZE / 2),
    y: Math.round(bbox.y + top + PAD_SIZE / 2)
  };
}

function expectApart(pads) {
  pads.forEach((pad, index) => {
    pads.slice(index + 1).forEach(other => {
      const distance = Math.hypot(pad.x - other.x, pad.y - other.y);

      expect(distance).to.be.at.least(PAD_SIZE);
    });
  });
}
