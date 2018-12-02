'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

function SetAnimationSpeed(canvas, animation, eventBus) {
  var self = this;

  this._canvas = canvas;
  this._animation = animation;
  this._eventBus = eventBus;

  this._init();

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      domClasses(self.container).add('hidden');
    } else {
      domClasses(self.container).remove('hidden');
    }
  });
}

SetAnimationSpeed.prototype._init = function() {
  var self = this;

  this.container = domify(
    '<div class="set-animation-speed hidden">' +
      '<i title="Set Animation Speed" class="fa fa-tachometer" aria-hidden="true"></i>' +
      '<div class="animation-speed-buttons">' +
        '<div title="Slow" id="animation-speed-1" class="animation-speed-button"><i class="fa fa-angle-right" aria-hidden="true"></i></div>' +
        '<div title="Normal" id="animation-speed-2" class="animation-speed-button active"><i class="fa fa-angle-right" aria-hidden="true"></i><i class="fa fa-angle-right" aria-hidden="true"></i></div>' +
        '<div title="Fast" id="animation-speed-3" class="animation-speed-button"><i class="fa fa-angle-right" aria-hidden="true"></i><i class="fa fa-angle-right" aria-hidden="true"></i><i class="fa fa-angle-right" aria-hidden="true"></i></div>' +
      '</div>' +
    '</div>'
  );

  var speed1 = domQuery('#animation-speed-1', this.container),
      speed2 = domQuery('#animation-speed-2', this.container),
      speed3 = domQuery('#animation-speed-3', this.container);

  domEvent.bind(speed1, 'click', function() {
    self.setActive(speed1);

    self._animation.setAnimationSpeed(0.5);
  });

  domEvent.bind(speed2, 'click', function() {
    self.setActive(speed2);

    self._animation.setAnimationSpeed(1);
  });

  domEvent.bind(speed3, 'click', function() {
    self.setActive(speed3);

    self._animation.setAnimationSpeed(1.5);
  });

  this._canvas.getContainer().appendChild(this.container);
};

SetAnimationSpeed.prototype.setActive = function(element) {
  domQuery.all('.animation-speed-button', this.container).forEach(function(button) {
    domClasses(button).remove('active');
  });

  domClasses(element).add('active');
};

SetAnimationSpeed.$inject = [ 'canvas', 'animation', 'eventBus' ];

module.exports = SetAnimationSpeed;