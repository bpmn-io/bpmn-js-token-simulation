var domEvent = require('min-dom/lib/event');

function KeyboardBindings(pauseSimulation) {
  domEvent.bind(document, 'keydown', function(e) {
    if (e.keyCode === 32) {
      pauseSimulation.toggle();

      return true;
    }
  });
}

KeyboardBindings.$inject = [ 'pauseSimulation' ];

module.exports = KeyboardBindings;