import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const VERY_HIGH_PRIORITY = 10000;


export default function KeyboardBindings(eventBus, injector) {

  var editorActions = injector.get('editorActions', false),
      keyboard = injector.get('keyboard', false);

  if (!keyboard || !editorActions) {
    return;
  }


  var isActive = false;


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


  eventBus.on('keyboard.init', function() {

    keyboard.addListener(VERY_HIGH_PRIORITY, function(event) {
      var keyEvent = event.keyEvent;

      handleKeyEvent(keyEvent);
    });

  });

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var active = context.active;

    if (active) {
      isActive = true;
    } else {
      isActive = false;
    }
  });

}

KeyboardBindings.$inject = [ 'eventBus', 'injector' ];


// helpers //////////

function isKey(keys, event) {
  return keys.indexOf(event.key) > -1;
}