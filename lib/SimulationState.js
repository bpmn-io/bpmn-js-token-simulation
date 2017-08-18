'use strict';

function SimulationState(eventBus, elementRegistry, tokenDisplay, catchEventTrigger) {
  var self = this;

  this.state = {
    active: false
  };

  // start simulation
  eventBus.on('tokenSimulation.createToken', function() {
    self.state.active = true;

    eventBus.fire('tokenSimulation.start');
  });

  eventBus.on('tokenSimulation.globalReset', function() {
    if (self.state.active) {
      // reset by deleting all tokens and stopping all animations

      self.state.active = false;

      eventBus.fire('tokenSimulation.reset');

      // delete all token counters
      elementRegistry.forEach(function(element) {
        tokenDisplay.removeAllTokens(element);
      });

      // close all context menus
      catchEventTrigger.closeAllContextMenus();
    }
  });
}

SimulationState.prototype.isActive = function() {
  return this.state.active;
}

SimulationState.$inject = [ 'eventBus', 'elementRegistry', 'tokenDisplay', 'catchEventTrigger' ];

module.exports = SimulationState;