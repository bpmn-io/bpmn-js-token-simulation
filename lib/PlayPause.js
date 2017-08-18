'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

function PlayPause(canvas, tokenSimulationBehavior, eventBus) {
  var self = this;

  this._canvas = canvas;
  this._tokenSimulationBehavior = tokenSimulationBehavior;
  this._eventBus = eventBus;

  this.isActive = false;
  this.isPlaying = false;

  var canvasParent = this.canvasParent =  canvas.getContainer().parentNode;

  this._init();

  eventBus.on('import.done', function() {
    domClasses(canvasParent).add('paused');
  });

  eventBus.on('tokenSimulation.start', function() {
    domClasses(self.button).add('active');
    domClasses(self.button).add('playing');

    domClasses(canvasParent).remove('paused');

    self.active = true;
    self.isPlaying = true;

    self.button.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';

    eventBus.fire('tokenSimulation.showNotification', {
      text: 'Start simulation'
    });
  });

  eventBus.on('tokenSimulation.reset', function() {
    domClasses(self.button).remove('active');
    domClasses(self.button).remove('playing');

    domClasses(canvasParent).add('paused');

    self.active = false;
    self.isPlaying = false;

    self.button.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';

    self._eventBus.fire('tokenSimulation.showNotification', {
      text: 'Reset simulation'
    });
  });
}

PlayPause.prototype._init = function() {
  var self = this;

  var button = this.button = domify('<div class="simulation-button hidden play-pause"><i class="fa fa-play" aria-hidden="true"></i></div>');

  domEvent.bind(button, 'click', function() {
    if (!self.active) return;

    if (self.isPlaying) {
      domClasses(button).remove('playing');

      button.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';

      self._tokenSimulationBehavior.runningAnimations.forEach(function(animation) {
        animation.pause();
      });

      var contextMenus = domQuery.all('.context-menu');

      contextMenus.forEach(function(contextMenu) {
        domClasses(contextMenu).add('disabled');
      });

      self._eventBus.fire('tokenSimulation.showNotification', {
        text: 'Pause simulation'
      });

      domClasses(self.canvasParent).add('paused');
    } else {
      domClasses(button).add('playing');

      button.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';

      self._tokenSimulationBehavior.runningAnimations.forEach(function(animation) {
        animation.play();
      });

      var contextMenus = domQuery.all('.context-menu');

      contextMenus.forEach(function(contextMenu) {
        domClasses(contextMenu).remove('disabled');
      });

      self._eventBus.fire('tokenSimulation.showNotification', {
        text: 'Resume simulation'
      });

      domClasses(self.canvasParent).remove('paused');
    }

    self.isPlaying = !self.isPlaying;
  });

  this._canvas.getContainer().appendChild(button);
};

PlayPause.$inject = [ 'canvas', 'tokenSimulationBehavior', 'eventBus' ];

module.exports = PlayPause;