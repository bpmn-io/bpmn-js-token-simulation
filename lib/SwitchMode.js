'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var MODELING_MODE = 'modeling',
    SIMULATION_MODE = 'simulation';

function SwitchMode(eventBus, canvas) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;

  this.mode = MODELING_MODE;

  eventBus.on('import.done', function() {
    self.canvasParent =  self._canvas.getContainer().parentNode;
    self.palette = domQuery('.djs-palette', self._canvas.getContainer());

    self._init();
  });
}

SwitchMode.prototype._init = function() {
  this.container = domify(`
    <div class="switch-mode">
      Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>
    </div>
  `);

  domEvent.bind(this.container, 'click', this.switch.bind(this));

  this._canvas.getContainer().appendChild(this.container);
};

SwitchMode.prototype.switch = function() {
  if (this.mode === MODELING_MODE) {
    this.mode = SIMULATION_MODE;

    this.container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-on"></i></span>';

    domClasses(this.canvasParent).add('simulation');
    domClasses(this.palette).add('hidden');

    domQuery.all('.simulation-button').forEach(function(element) {
      domClasses(element).remove('hidden');
    });

    this._eventBus.fire('tokenSimulation.switchMode', { mode: SIMULATION_MODE });
  } else {
    this.mode = MODELING_MODE;

    this.container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>';

    domClasses(this.canvasParent).remove('simulation');
    domClasses(this.palette).remove('hidden');

    domQuery.all('.simulation-button').forEach(function(element) {
      domClasses(element).add('hidden');
    });

    this._eventBus.fire('tokenSimulation.switchMode', { mode: MODELING_MODE });
  }
};

SwitchMode.$inject = [ 'eventBus', 'canvas' ];

module.exports = SwitchMode;