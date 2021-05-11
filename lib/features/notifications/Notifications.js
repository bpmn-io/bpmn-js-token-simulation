import {
  domify
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT
} from '../../util/EventHelper';

const NOTIFICATION_TIME_TO_LIVE = 2000; // ms


export default function Notifications(eventBus, canvas, scopeFilter) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._init();

  eventBus.on([
    TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT
  ], event => {
    this.clear();
  });
}

Notifications.prototype._init = function() {
  this.container = domify('<div class="notifications"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

Notifications.prototype.showNotification = function(options) {

  const {
    text,
    type = 'info',
    icon = 'fa-info',
    scope,
    ttl = NOTIFICATION_TIME_TO_LIVE
  } = options;

  if (scope && !this._scopeFilter.isShown(scope)) {
    return;
  }

  const iconMarkup = `<i class="${icon} ${
    icon.includes('bpmn') ? '' : 'fa'
  } ${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"` : '';

  const notification = domify(`
    <div class="notification ${type}">
      <span class="icon">${iconMarkup}</span>
      <span class="text">${text}</span>
      ${ scope ? `<span class="scope" ${colorMarkup}>${scope.id}</span>` : '' }
    </div>
  `);

  this.container.appendChild(notification);

  // prevent more than 5 notifications at once
  while (this.container.children.length > 5) {
    this.container.children[0].remove();
  }

  setTimeout(function() {
    notification.remove();
  }, ttl);
};

Notifications.prototype.clear = function() {
  while (this.container.children.length) {
    this.container.children[0].remove();
  }
};

Notifications.$inject = [
  'eventBus',
  'canvas',
  'scopeFilter'
];