'use strict';

function EditorActions(editorActions, eventBus, switchMode) {
  editorActions.register({
    toggleTokenSimulation: function() {
      switchMode.switch();
    }
  });
}

EditorActions.$inject = [ 'editorActions', 'eventBus', 'switchMode' ];

module.exports = EditorActions;