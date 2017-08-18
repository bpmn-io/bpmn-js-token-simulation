'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var NOTIFICATION_TIME_TO_LIVE = 2000; // ms

function Notifications(eventBus, canvas) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._init();

  eventBus.on('tokenSimulation.showNotification', function(context) {
    var text = context.text,
        type = context.notificationType,
        icon = context.icon;

    self.showNotification(text, type, icon);
  });

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'modeling') {
      self.removeAll();
    }
  });
}

Notifications.prototype._init = function() {
  this.container = domify('<div class="notifications"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

Notifications.prototype.showNotification = function(text, type, icon) {
  var notification = domify(`
    <div class="notification ${type}">
      <i class="${icon || 'fa fa-info'}" aria-hidden="true"></i>
      &nbsp;&nbsp;&nbsp;${text}
    </div>
  `);

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