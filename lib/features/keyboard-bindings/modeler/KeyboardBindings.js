'use strict';

var domClosest = require('min-dom/lib/closest'),
    domEvent = require('min-dom/lib/event');

var events = require('../../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

// TODO: find a better way to check if Camunda Modeler
function isCamundaModeler(canvas) {
  var container = canvas.getContainer();

  return domClosest(container, '.editor-parent') &&
         domClosest(container, '.editor-container') &&
         domClosest(container, '.bpmn-editor') &&
         domClosest(container, '.content');
}

function KeyboardBindings(canvas, eventBus, editorActions, keyboard) {

  var isActive = false;

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (simulationModeActive) {
      isActive = true;
    } else {
      isActive = false;
    }
  });

  eventBus.on('import.done', function() {

    // Camunda Modeler doesn't bind keyboard therefore needs special treatment
    if (isCamundaModeler(canvas)) {
      domEvent.bind(window, 'keydown', function(e) {
        var key = e.keyCode;

        if (!isActive) {
          return;
        }

        // space
        if (key === 32) {
          editorActions.trigger('togglePauseTokenSimulation');
        }

        // r
        if (key === 82) {
          editorActions.trigger('resetTokenSimulation');
        }

        // l
        if (key === 76) {
          editorActions.trigger('toggleTokenSimulationLog');
        }
      });
    } else {
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
  });
}

KeyboardBindings.$inject = [ 'canvas', 'eventBus', 'editorActions', 'keyboard' ];

module.exports = KeyboardBindings;