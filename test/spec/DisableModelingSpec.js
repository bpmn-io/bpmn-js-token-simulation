import TokenSimulationModelerModules from '../..';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';


describe('disable modeling', function() {

  const diagram = require('./simple.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      TokenSimulationModelerModules
    ]
  }));


  it('should lock canvas while simulating', inject(
    function(toggleMode, canvasLock) {

      // assume
      expect(canvasLock.isLocked()).to.be.false;

      // when
      toggleMode.toggleMode();

      // then
      expect(canvasLock.isLocked()).to.be.true;
    }
  ));


  it('should unlock canvas when leaving simulation', inject(
    function(toggleMode, canvasLock) {

      // given
      toggleMode.toggleMode();

      // when
      toggleMode.toggleMode();

      // then
      expect(canvasLock.isLocked()).to.be.false;
    }
  ));


  it('should keep simulation editor actions allowed while locked', inject(
    function(toggleMode, eventBus) {

      // given
      toggleMode.toggleMode();

      // when
      const allowed = eventBus.fire('editorActions.allowed', {
        action: 'toggleTokenSimulation'
      });

      // then
      expect(allowed).to.be.true;
    }
  ));


  it('should block modeling editor actions while locked', inject(
    function(toggleMode, eventBus) {

      // given
      toggleMode.toggleMode();

      // when
      const allowed = eventBus.fire('editorActions.allowed', {
        action: 'undo'
      });

      // then
      expect(allowed).to.be.false;
    }
  ));

});
