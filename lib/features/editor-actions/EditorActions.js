import { TOGGLE_MODE_EVENT } from '../../util/EventHelper';

export default function EditorActions(
    eventBus,
    toggleMode,
    pauseSimulation,
    resetSimulation,
    editorActions,
    injector
) {
  var active = false;

  editorActions.register({
    toggleTokenSimulation: function() {
      toggleMode.toggleMode();
    }
  });

  editorActions.register({
    togglePauseTokenSimulation: function() {
      active && pauseSimulation.toggle();
    }
  });

  editorActions.register({
    resetTokenSimulation: function() {
      active && resetSimulation.resetSimulation();
    }
  });

  const log = injector.get('log', false);

  log && editorActions.register({
    toggleTokenSimulationLog: function() {
      log.toggle();
    }
  });

  eventBus.on(TOGGLE_MODE_EVENT, (event) => {
    active = event.active;
  });
}

EditorActions.$inject = [
  'eventBus',
  'toggleMode',
  'pauseSimulation',
  'resetSimulation',
  'editorActions',
  'injector'
];