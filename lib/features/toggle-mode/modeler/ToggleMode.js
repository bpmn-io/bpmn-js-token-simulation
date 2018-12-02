'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var events = require('../../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

function ToggleMode(eventBus, canvas, selection, contextPad) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._selection = selection;
  this._contextPad = contextPad;

  this.simulationModeActive = false;

  eventBus.on('import.done', function() {
    self.canvasParent = self._canvas.getContainer().parentNode;
    self.palette = domQuery('.djs-palette', self._canvas.getContainer());

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
    domClasses(this.palette).remove('hidden');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: false
    });

    var elements = this._selection.get();

    if (elements.length === 1) {
      this._contextPad.open(elements[0]);
    }
  } else {
    this.container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-on"></i></span>';

    domClasses(this.canvasParent).add('simulation');
    domClasses(this.palette).add('hidden');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: true
    });
  }

  this.simulationModeActive = !this.simulationModeActive;
};

ToggleMode.$inject = [ 'eventBus', 'canvas', 'selection', 'contextPad' ];

module.exports = ToggleMode;