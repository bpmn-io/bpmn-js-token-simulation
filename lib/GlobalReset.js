'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

function GlobalReset(canvas, eventBus) {
  var self = this;

  this._canvas = canvas;
  this._eventBus = eventBus;

  this.init();
  
  this.active = false;

  eventBus.on('tokenSimulation.start', function() {
    domClasses(self.button).add('active');

    self.active = true;
  });

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'modeling') {
      self._eventBus.fire('tokenSimulation.globalReset');
    }
  });
}

GlobalReset.prototype.init = function() {
  var self = this;

  this.button = domify('<div class="simulation-button hidden global-reset"><i class="fa fa-refresh"></i></div>');

  domEvent.bind(this.button, 'click', function() {
    if (self.active) {
      self._eventBus.fire('tokenSimulation.globalReset');

      domClasses(self.button).remove('active');

      self.active = true;
    }
  });

  this._canvas.getContainer().appendChild(this.button);
}

GlobalReset.$inject = [ 'canvas', 'eventBus' ];

module.exports = GlobalReset;