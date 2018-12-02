'use strict';

var domify = require('min-dom/lib/domify');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var NOTIFICATION_TIME_TO_LIVE = 2000; // ms

function Notifications(eventBus, canvas) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._init();

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.removeAll();
    }
  });
}

Notifications.prototype._init = function() {
  this.container = domify('<div class="notifications"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

Notifications.prototype.showNotification = function(text, type, icon) {
  var iconMarkup;

  if (!icon) {
    icon = 'fa-info';
  }

  if (icon.includes('bpmn')) {
    iconMarkup = '<i class="' + icon + '"></i>';
  } else {
    iconMarkup = '<i class="fa ' + icon + '"></i>';
  }

  var notification = domify(
    '<div class="notification ' + type + '">' +
      '<span class="icon">' + iconMarkup + '</span>' +
      text +
    '</div>'
  );

  this.container.appendChild(notification);

  // prevent more than 5 notifications at once
  while (this.container.children.length > 5) {
    this.container.children[0].remove();
  }

  setTimeout(function() {
    notification.remove();
  }, NOTIFICATION_TIME_TO_LIVE);
};

Notifications.prototype.removeAll = function() {
  while (this.container.children.length) {
    this.container.children[0].remove();
  }
};

Notifications.$inject = [ 'eventBus', 'canvas' ];

module.exports = Notifications;