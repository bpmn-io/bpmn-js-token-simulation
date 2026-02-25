import ModelerModule from 'lib/modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';
import { spy } from 'sinon';


describe('features/keyboard-bindings', function() {

  const diagramXML = require('../../simple.bpmn');

  let button;

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ModelerModule
    ]
  }));

  beforeEach(inject(function(toggleMode) {
    toggleMode.toggleMode();
  }));

  beforeEach(function() {
    button = document.createElement('button');

    document.body.appendChild(button);
    button.focus();
  });

  afterEach(function() {
    button.remove();
  });


  it('should not toggle pause when space activates focused control via keyboard navigation', inject(
    function(keyboard, editorActions) {

      // given
      const triggerSpy = spy(editorActions, 'trigger');

      // when
      triggerKey(keyboard, ' ', button);

      // then
      expect(triggerSpy).to.not.have.been.called;
    }
  ));


  it('should toggle pause after mouse interaction even if control stays focused', inject(
    function(keyboard, editorActions) {

      // given
      const triggerSpy = spy(editorActions, 'trigger');

      triggerMouseDown(button);

      // when
      triggerKey(keyboard, ' ', button);

      // then
      expect(triggerSpy).to.have.been.calledOnce;
      expect(triggerSpy).to.have.been.calledWith('togglePauseTokenSimulation');
    }
  ));


  it('should restore native focused-control behavior after tab interaction', inject(
    function(keyboard, editorActions) {

      // given
      const triggerSpy = spy(editorActions, 'trigger');

      triggerMouseDown(button);

      // assume
      triggerKey(keyboard, ' ', button);
      expect(triggerSpy).to.have.been.calledOnce;

      // when
      triggerKey(keyboard, 'Tab', button);
      triggerKey(keyboard, ' ', button);

      // then
      expect(triggerSpy).to.have.been.calledOnce;
    }
  ));

});


function triggerKey(keyboard, key, target) {
  keyboard._keyHandler({
    key,
    target,
    preventDefault: function() {}
  }, 'keyboard.keydown');
}

function triggerMouseDown(target) {
  target.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true
  }));
}
