import {
  domify
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  SCOPE_CREATE_EVENT
} from '../../util/EventHelper';

const OFFSET_TOP = -15;
const OFFSET_RIGHT = 15;


export default function ElementNotifications(overlays, eventBus) {
  this._overlays = overlays;

  eventBus.on([
    RESET_SIMULATION_EVENT,
    SCOPE_CREATE_EVENT,
    TOGGLE_MODE_EVENT
  ], () => {
    this.clear();
  });
}

ElementNotifications.prototype.addElementNotification = function(element, options) {
  const position = {
    top: OFFSET_TOP,
    right: OFFSET_RIGHT
  };

  const {
    type,
    icon,
    text,
    scope = {}
  } = options;

  const colors = scope.colors;

  const colorMarkup = colors
    ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"`
    : '';

  const html = domify(`
    <div class="bts-element-notification ${ type || '' }" ${colorMarkup}>
      ${ icon || '' }
      <span class="bts-text">${ text }</span>
    </div>
  `);

  this._overlays.add(element, 'element-notification', {
    position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

ElementNotifications.prototype.clear = function() {
  this._overlays.remove({ type: 'element-notification' });
};

ElementNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

ElementNotifications.$inject = [ 'overlays', 'eventBus' ];