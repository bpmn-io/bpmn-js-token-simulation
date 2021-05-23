export default function EditorActions(
    eventBus,
    toggleMode,
    pauseSimulation,
    log,
    resetSimulation,
    editorActions
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
}

EditorActions.$inject = [
  'eventBus',
  'toggleMode',
  'pauseSimulation',
  'log',
  'resetSimulation',
  'editorActions'
];