'use strict';

var domify = require('min-dom').domify,
    domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event;

var events = require('../../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

function ToggleMode(eventBus, canvas, selection) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;

  this.simulationModeActive = false;

  eventBus.on('import.done', function() {
    self.canvasParent = self._canvas.getContainer().parentNode;

    self._init();
  });
}

ToggleMode.prototype._init = function() {
  this.container = domify(`
    <div class="toggle-mode">
      Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>
    </div>
  `);

  domEvent.bind(this.container, 'click', this.toggleMode.bind(this));

  this._canvas.getContainer().appendChild(this.container);
};

ToggleMode.prototype.toggleMode = function() {
  if (this.simulationModeActive) {
    this.container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>';

    domClasses(this.canvasParent).remove('simulation');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: false
    });
  } else {
    this.container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-on"></i></span>';

    domClasses(this.canvasParent).add('simulation');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: true
    });
  }

  this.simulationModeActive = !this.simulationModeActive;
};

ToggleMode.$inject = [ 'eventBus', 'canvas' ];

module.exports = ToggleMode;