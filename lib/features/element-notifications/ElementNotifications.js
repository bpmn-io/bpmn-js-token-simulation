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


const STYLE = getComputedStyle(document.documentElement);

const DEFAULT_PRIMARY_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');
const DEFAULT_AUXILIARY_COLOR = STYLE.getPropertyValue('--token-simulation-white');


export default function ElementNotifications(overlays, eventBus) {
  this._overlays = overlays;

  eventBus.on([
    RESET_SIMULATION_EVENT,
    SCOPE_CREATE_EVENT,
    TOGGLE_MODE_EVENT
  ], () => {
    this.removeElementNotifications();
  });
}

ElementNotifications.prototype.addElementNotifications = function(elements, options) {
  elements.forEach(element => {
    this.addElementNotification(element, options);
  });
};

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

  const colors = scope.colors || {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  const html = domify(`
    <div class="element-notification ${ type || '' }"
         style="color: ${colors.auxiliary}; background: ${colors.primary}">
      ${ icon ? `<i class="fa ${ icon }"></i>` : '' }
      <span class="text">${ text }</span>
    </div>
  `);

  this._overlays.add(element, 'element-notification', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

ElementNotifications.prototype.removeElementNotifications = function(elements) {

  if (!elements) {
    this._overlays.remove({ type: 'element-notification' });
  } else {
    elements.forEach(element => {
      this.removeElementNotification(element);
    });
  }
};

ElementNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

ElementNotifications.$inject = [ 'overlays', 'eventBus' ];