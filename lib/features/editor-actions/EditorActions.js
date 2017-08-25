'use strict';

function EditorActions(eventBus, toggleMode, editorActions) {
  editorActions.register({
    toggleTokenSimulation: function() {
      toggleMode.toggleMode();
    }
  });
}

EditorActions.$inject = [ 'eventBus', 'toggleMode', 'editorActions' ];

module.exports = EditorActions;