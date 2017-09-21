'use strict';

function EditorActions(
  eventBus,
  toggleMode,
  pauseSimulation,
  log,
  resetSimulation,
  editorActions,
  animation
) {
  editorActions.register({
    toggleTokenSimulation: function() {
      toggleMode.toggleMode();
    }
  });

  editorActions.register({
    togglePauseTokenSimulation: function() {
      pauseSimulation.toggle();
    }
  });

  editorActions.register({
    resetTokenSimulation: function() {
      resetSimulation.resetSimulation();
    }
  });

  editorActions.register({
    toggleTokenSimulationLog: function() {
      log.toggle();
    }
  });

  editorActions.register({
    toggleCandle: function() {
      animation.toggleCandle();
    }
  });
}

EditorActions.$inject = [
  'eventBus',
  'toggleMode',
  'pauseSimulation',
  'log',
  'resetSimulation',
  'editorActions',
  'animation'
];

module.exports = EditorActions;