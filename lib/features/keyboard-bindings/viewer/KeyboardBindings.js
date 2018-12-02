'use strict';

var domEvent = require('min-dom/lib/event');

var events = require('../../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

function KeyboardBindings(
    eventBus,
    toggleMode,
    pauseSimulation,
    log,
    resetSimulation
) {
  var isActive = false;

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (simulationModeActive) {
      isActive = true;
    } else {
      isActive = false;
    }
  });

  domEvent.bind(document, 'keydown', function(e) {
    var key = e.keyCode;

    // t
    if (key === 84) {
      toggleMode.toggleMode();
    }

    if (!isActive) {
      return;
    }

    // space
    if (key === 32) {
      pauseSimulation.toggle();
    }

    // r
    if (key === 82) {
      resetSimulation.resetSimulation();
    }

    // l
    if (key === 76) {
      log.toggle();
    }
  });
}

KeyboardBindings.$inject = [
  'eventBus',
  'toggleMode',
  'pauseSimulation',
  'log',
  'resetSimulation'
];

module.exports = KeyboardBindings;