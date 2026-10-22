import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler as _bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import translateModule from './custom-translate';

import { expect } from 'chai';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


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


describe('i18n', function() {

  beforeEach(bootstrapModeler(require('../simple.bpmn'), translateModule));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation();
  }));


  it('should translate', inject(
    async function() {

      // when
      triggerElement('StartEvent_1');

      await scopeDestroyed();

      // then

      // text content
      expect(getLabel()).to.equal('Token "Simulation" & <Co>');

      // attributes
      expect(getPaletteTitles()).to.eql([
        'Abspielen & "Pausieren"',
        'Zurücksetzen & "neu"',
        'Protokoll "anzeigen" & <b>fett</b>'
      ]);

      // templates
      expect(getAnimationSpeedTitles()).to.eql([
        'Tempo "festlegen" & <b>los</b> = Langsam & "träge"',
        'Tempo "festlegen" & <b>los</b> = Normal',
        'Tempo "festlegen" & <b>los</b> = Schnell'
      ]);
    }
  ));

});


describe('i18n - escaping', function() {

  beforeEach(bootstrapModeler(require('./escaped-names.bpmn'), translateModule));

  beforeEach(inject(function(simulationSupport) {
    simulationSupport.toggleSimulation();
  }));


  it('should render translated text content as text, not HTML', inject(
    function() {

      // then
      const label = domQuery('.bts-toggle-mode .bts-label', getContainer());

      expect(label.textContent.trim()).to.equal('Token "Simulation" & <Co>');

      // no markup injected
      expect(label.children).to.have.length(0);
    }
  ));


  it('should render translated attribute as text, not HTML', inject(
    function() {

      // then
      expect(getPaletteTitles()[0]).to.equal('Abspielen & "Pausieren"');
    }
  ));


  it('should render element name in template as text, not HTML', inject(
    async function() {

      // when
      triggerElement('START');

      await elementEnter('Order_Receive');

      // then
      expect(getLogEntries()).to.include('R&D "Order" "gestartet" & <b>los</b>');

      // no markup injected
      expect(domQueryAll('.bts-log .bts-text b', getContainer())).to.have.length(0);
    }
  ));

});


// helpers ////////////////////

function bootstrapModeler(diagram, translate) {
  return _bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule,
      translate
    ],
    animation: {
      randomize: false
    }
  });
}

function getContainer() {
  return getBpmnJS().get('canvas').getContainer();
}

function getLabel() {
  return domQuery('.bts-toggle-mode .bts-label', getContainer()).textContent.trim();
}

function getPaletteTitles() {
  return Array.from(domQueryAll('.bts-palette .bts-entry', getContainer()))
    .map(element => element.title);
}

function getAnimationSpeedTitles() {
  return Array.from(domQueryAll('.bts-animation-speed-button', getContainer()))
    .map(element => element.title);
}

function getLogEntries() {
  return Array.from(domQueryAll('.bts-log .bts-content .bts-entry .bts-text', getContainer()))
    .map(element => element.textContent.trim());
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

function scopeDestroyed(...args) {
  return getSimulationSupport().scopeDestroyed(...args);
}
