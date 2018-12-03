'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var domify = require('min-dom/lib/domify');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

var OFFSET_TOP = -15,
    OFFSET_RIGHT = 15;

function ElementNotifications(overlays, eventBus) {
  var self = this;

  this._overlays = overlays;

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.removeElementNotifications();
    }
  });

  eventBus.on([
    RESET_SIMULATION_EVENT,
    GENERATE_TOKEN_EVENT
  ], function() {
    self.removeElementNotifications();
  });
}

ElementNotifications.prototype.addElementNotifications = function(elements, options) {
  var self = this;

  elements.forEach(function(element) {
    self.addElementNotification(element, options);
  });
};

ElementNotifications.prototype.addElementNotification = function(element, options) {
  var position = {
    top: OFFSET_TOP,
    right: OFFSET_RIGHT
  };

  var markup =
    '<div class="element-notification ' + (options.type || '') + '">' +
      (options.icon ? '<i class="fa ' + options.icon + '"></i>' : '') +
      ('<span class="text">' + options.text + '</span>' || '') +
    '</div>';

  var html = domify(markup);

  this._overlays.add(element, 'element-notification', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

ElementNotifications.prototype.removeElementNotifications = function(elements) {
  var self = this;

  if (!elements) {
    this._overlays.remove({ type: 'element-notification' });
  } else {
    elements.forEach(function(element) {
      self.removeElementNotification(element);
    });
  }
};

ElementNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

ElementNotifications.$inject = [ 'overlays', 'eventBus' ];

module.exports = tryCatchAll(ElementNotifications);