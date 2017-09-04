'use strict';

var events = require('../../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

function KeyboardBindings(eventBus, editorActions, keyboard) {

  var isActive = false;

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (simulationModeActive) {
      isActive = true;
    } else {
      isActive = false;
    }
  });

  keyboard.addListener(function(key) {
    
    // t
    if (key === 84) {
      editorActions.trigger('toggleTokenSimulation');

      return true;
    }

    if (!isActive) {
      return;
    }

    // space
    if (key === 32) {
      editorActions.trigger('togglePauseTokenSimulation');

      return true;
    }

    // r
    if (key === 82) {
      editorActions.trigger('resetTokenSimulation');

      return true;
    }
  });

  // see https://github.com/bpmn-io/diagram-js/issues/226
  keyboard._listeners.unshift(function(key) {
    if (!isActive) {
      return;
    }

    // l
    if (key === 76) {
      editorActions.trigger('toggleTokenSimulationLog');

      return true;
    }
  });
}

KeyboardBindings.$inject = [ 'eventBus', 'editorActions', 'keyboard' ];

module.exports = KeyboardBindings;