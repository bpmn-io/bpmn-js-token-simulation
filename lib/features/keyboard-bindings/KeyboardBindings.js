'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    VERY_HIGH_PRIORITY = 10000;


function KeyboardBindings(eventBus, injector) {

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

    function handleKeyEvent(keyEvent) {
      if (isKey([ 't', 'T' ], keyEvent)) {
        editorActions.trigger('toggleTokenSimulation');

        return true;
      }

      if (!isActive) {
        return;
      }

      if (isKey([ 'l', 'L' ], keyEvent)) {
        editorActions.trigger('toggleTokenSimulationLog');

        return true;
      }

      // see https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/key/Key_Values#Whitespace_keys
      if (isKey([ ' ', 'Spacebar' ], keyEvent)) {
        editorActions.trigger('togglePauseTokenSimulation');

        return true;
      }

      if (isKey([ 'r', 'R' ], keyEvent)) {
        editorActions.trigger('resetTokenSimulation');

        return true;
      }
    }

    var editorActions = injector.get('editorActions', false),
        keyboard = injector.get('keyboard', false);

    if (editorActions && keyboard && isKeyboardBound(keyboard)) {
      keyboard.addListener(VERY_HIGH_PRIORITY, function(event) {
        var keyEvent = event.keyEvent;

        handleKeyEvent(keyEvent);
      });
    }
  });
}

KeyboardBindings.$inject = [ 'eventBus', 'injector' ];

module.exports = tryCatchAll(KeyboardBindings);

// helpers //////////

function isKey(keys, event) {
  return keys.indexOf(event.key) > -1;
}

function isKeyboardBound(keyboard) {
  return keyboard._config && keyboard._config.bindTo;
}