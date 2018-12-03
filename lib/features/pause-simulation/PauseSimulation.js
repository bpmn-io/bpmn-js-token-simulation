'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    PLAY_SIMULATION_EVENT = events.PLAY_SIMULATION_EVENT,
    PAUSE_SIMULATION_EVENT = events.PAUSE_SIMULATION_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    ANIMATION_CREATED_EVENT = events.ANIMATION_CREATED_EVENT,
    PROCESS_INSTANCE_CREATED_EVENT = events.PROCESS_INSTANCE_CREATED_EVENT;

var PLAY_MARKUP = '<i class="fa fa-play"></i>',
    PAUSE_MARKUP = '<i class="fa fa-pause"></i>';

function PauseSimulation(eventBus, tokenSimulationPalette, notifications, canvas) {
  var self = this;

  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._notifications = notifications;

  this.canvasParent = canvas.getContainer().parentNode;

  this.isActive = false;
  this.isPaused = false;

  this._init();

  // unpause on simulation start
  eventBus.on(PROCESS_INSTANCE_CREATED_EVENT, function(context) {
    var parent = context.parent;

    if (!parent.parent) {
      self.activate();
      self.unpause();

      notifications.showNotification('Start Simulation', 'info');
    }
  });

  eventBus.on([
    RESET_SIMULATION_EVENT,
    TOGGLE_MODE_EVENT
  ], function() {
    self.deactivate();
    self.unpause();
  });

  eventBus.on(ANIMATION_CREATED_EVENT, function(context) {
    var animation = context.animation;

    if (self.isPaused) {
      animation.pause();
    }
  });
}

PauseSimulation.prototype._init = function() {
  this.paletteEntry = domify(
    '<div class="entry disabled" title="Play/Pause Simulation">' +
      PLAY_MARKUP +
    '</div>'
  );

  domEvent.bind(this.paletteEntry, 'click', this.toggle.bind(this));

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 1);
};

PauseSimulation.prototype.toggle = function() {
  if (!this.isActive) {
    return;
  }

  if (this.isPaused) {
    this.unpause();
  } else {
    this.pause();
  }
};

PauseSimulation.prototype.pause = function() {
  if (!this.isActive) {
    return;
  }

  domClasses(this.paletteEntry).remove('active');
  domClasses(this.canvasParent).add('paused');

  this.paletteEntry.innerHTML = PLAY_MARKUP;

  this._eventBus.fire(PAUSE_SIMULATION_EVENT);

  this._notifications.showNotification('Pause Simulation', 'info');

  this.isPaused = true;
};

PauseSimulation.prototype.unpause = function() {
  if (!this.isActive) {
    return;
  }

  domClasses(this.paletteEntry).add('active');
  domClasses(this.canvasParent).remove('paused');

  this.paletteEntry.innerHTML = PAUSE_MARKUP;

  this._eventBus.fire(PLAY_SIMULATION_EVENT);

  this._notifications.showNotification('Play Simulation', 'info');

  this.isPaused = false;
};

PauseSimulation.prototype.activate = function() {
  this.isActive = true;

  domClasses(this.paletteEntry).remove('disabled');
};

PauseSimulation.prototype.deactivate = function() {
  this.isActive = false;

  domClasses(this.paletteEntry).remove('active');
  domClasses(this.paletteEntry).add('disabled');
};

PauseSimulation.$inject = [ 'eventBus', 'tokenSimulationPalette', 'notifications', 'canvas' ];

module.exports = tryCatchAll(PauseSimulation);