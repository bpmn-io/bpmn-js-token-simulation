import {
  classes as domClasses
} from 'min-dom';

import {
  is
} from '../../util/ElementHelper';

import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

import {
  ExclamationTriangleIcon
} from '../../icons';


const UNSUPPORTED_ELEMENTS = [
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
];

function isLabel(element) {
  return element.labelTarget;
}


export default function ElementSupport(
    eventBus, elementRegistry, canvas,
    notifications, elementNotifications) {

  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._elementNotifications = elementNotifications;
  this._notifications = notifications;

  this._canvasParent = canvas.getContainer().parentNode;

  eventBus.on(TOGGLE_MODE_EVENT, event => {

    if (event.active) {
      this.enable();
    } else {
      this.clear();
    }
  });
}

ElementSupport.prototype.getUnsupportedElements = function() {
  return this._unsupportedElements;
};

ElementSupport.prototype.enable = function() {

  const unsupportedElements = [];

  this._elementRegistry.forEach(element => {

    if (isLabel(element)) {
      return;
    }

    if (!is(element, UNSUPPORTED_ELEMENTS)) {
      return;
    }

    this.showWarning(element);

    unsupportedElements.push(element);
  });

  if (unsupportedElements.length) {

    this._notifications.showNotification({
      text: 'Found unsupported elements',
      icon: ExclamationTriangleIcon(),
      type: 'warning',
      ttl: 5000
    });
  }

  this._unsupportedElements = unsupportedElements;
};

ElementSupport.prototype.clear = function() {
  domClasses(this._canvasParent).remove('warning');
};

ElementSupport.prototype.showWarning = function(element) {
  this._elementNotifications.addElementNotification(element, {
    type: 'warning',
    icon: ExclamationTriangleIcon(),
    text: 'Not supported'
  });
};

ElementSupport.$inject = [
  'eventBus',
  'elementRegistry',
  'canvas',
  'notifications',
  'elementNotifications'
];