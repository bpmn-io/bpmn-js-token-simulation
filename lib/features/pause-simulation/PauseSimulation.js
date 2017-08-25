'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var is = require('../../util/ElementHelper').is;

var events = require('../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    PLAY_SIMULATION_EVENT = events.PLAY_SIMULATION_EVENT,
    PAUSE_SIMULATION_EVENT = events.PAUSE_SIMULATION_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT;

function PauseSimulation(eventBus, tokenSimulationPalette, notifications, canvas) {
  var self = this;
  
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._notifications = notifications;

  this.canvasParent =  canvas.getContainer().parentNode;
  
  this.isActive = false;
  this.isPaused = false;

  this._init();

  eventBus.on(GENERATE_TOKEN_EVENT, function(context) {
    if (!is(context.element, 'bpmn:StartEvent')) {
      return;
    }

    self.isActive = true;
    self.isPaused = false;

    domClasses(self.paletteEntry).remove('disabled');
    domClasses(self.paletteEntry).add('active');

    self.paletteEntry.innerHTML = '<i class="fa fa-play"></i>';

    notifications.showNotification('Start Simulation', 'info');

    domClasses(self.canvasParent).remove('paused');
  });

  eventBus.on([
    RESET_SIMULATION_EVENT,
    TOGGLE_MODE_EVENT
  ], function() {
    self.isActive = false;
    self.isPaused = false;

    domClasses(self.paletteEntry).add('disabled');
    domClasses(self.paletteEntry).remove('active');

    self.paletteEntry.innerHTML = '<i class="fa fa-play"></i>';

    domClasses(self.canvasParent).remove('paused');
  });
}

PauseSimulation.prototype._init = function() {
  this.paletteEntry = domify('<div class="entry disabled" title="Play/Pause Simulation"><i class="fa fa-play"></i></div>');

  domEvent.bind(this.paletteEntry, 'click', this.toggle.bind(this));

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 1);
};

PauseSimulation.prototype.toggle = function() {
  if (!this.isActive) {
    return;
  }

  if (this.isPaused) {
    domClasses(this.paletteEntry).add('active');
    domClasses(this.canvasParent).remove('paused');

    this.paletteEntry.innerHTML = '<i class="fa fa-play"></i>';

    this._eventBus.fire(PLAY_SIMULATION_EVENT);

    this._notifications.showNotification('Play Simulation', 'info');
  } else {
    domClasses(this.paletteEntry).remove('active');
    domClasses(this.canvasParent).add('paused');

    this.paletteEntry.innerHTML = '<i class="fa fa-pause"></i>';

    this._eventBus.fire(PAUSE_SIMULATION_EVENT);

    this._notifications.showNotification('Pause Simulation', 'info');
  }

  this.isPaused = !this.isPaused;
};

PauseSimulation.$inject = [ 'eventBus', 'tokenSimulationPalette', 'notifications', 'canvas' ];

module.exports = PauseSimulation;