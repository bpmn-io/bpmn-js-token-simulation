import {
  isAncestor
} from '../../util/ElementHelper';

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  ELEMENT_CHANGED_EVENT
} from '../../util/EventHelper';

import BoundaryEventHandler from './handler/BoundaryEventHandler';
import ExclusiveGatewayHandler from './handler/ExclusiveGatewayHandler';
import IntermediateCatchEventHandler from './handler/IntermediateCatchEventHandler';
import StartEventHandler from './handler/StartEventHandler';

// TODO(nikku): restore or delete
// import ProcessHandler from './handler/ProcessHandler';

const LOW_PRIORITY = 500;

const OFFSET_TOP = -15;
const OFFSET_LEFT = -15;


export default function ContextPads(
    eventBus, elementRegistry,
    overlays, injector, canvas) {

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._injector = injector;
  this._canvas = canvas;

  this._overlayIds = {};

  this._handlers = {};

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', IntermediateCatchEventHandler);
  this.registerHandler('bpmn:ReceiveTask', IntermediateCatchEventHandler);

  // TODO(nikku): restore or delete
  // this.registerHandler('bpmn:SubProcess', ProcessHandler);

  this.registerHandler('bpmn:SubProcess', BoundaryEventHandler);
  this.registerHandler('bpmn:BoundaryEvent', BoundaryEventHandler);
  this.registerHandler('bpmn:StartEvent', StartEventHandler);

  eventBus.on(TOGGLE_MODE_EVENT, LOW_PRIORITY, context => {
    const active = context.active;

    if (active) {
      this.openContextPads();
    } else {
      this.closeContextPads();
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    this.closeContextPads();
    this.openContextPads();
  });

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {
    const {
      element
    } = event;

    this.closeElementContextPads(element);
    this.openElementContextPads(element);
  });
}

/**
 * Register a handler for an element type.
 * An element type can have multiple handlers.
 *
 * @param {String} type
 * @param {Object} handlerCls
 */
ContextPads.prototype.registerHandler = function(type, handlerCls) {
  var handler = this._injector.instantiate(handlerCls);

  if (!this._handlers[type]) {
    this._handlers[type] = [];
  }

  this._handlers[type].push(handler);
};

ContextPads.prototype.openContextPads = function(parent) {

  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach((element) => {
    if (isAncestor(parent, element)) {
      this.openElementContextPads(element);
    }
  });
};

ContextPads.prototype.openElementContextPads = function(element) {

  const handlers = this._handlers[element.type] || [];

  const contextPads = [];

  for (const handler of handlers) {
    const additionalPads = handler.createContextPads(element) || [];

    contextPads.push(...additionalPads.filter(p => p));
  }

  for (const contextPad of contextPads) {
    const position = {
      top: OFFSET_TOP,
      left: OFFSET_LEFT
    };

    const overlayId = this._overlays.add(contextPad.element, 'context-menu', {
      position: position,
      html: contextPad.html,
      show: {
        minZoom: 0.5
      }
    });

    this._overlayIds[contextPad.element.id] = overlayId;
  }
};

ContextPads.prototype.closeContextPads = function(parent) {
  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach(element => {
    if (isAncestor(parent, element)) {
      this.closeElementContextPads(element);
    }
  });
};

ContextPads.prototype.closeElementContextPads = function(element) {
  (element.attachers || []).forEach(attachedElement => {
    this.closeElementContextPads(attachedElement);
  });

  var overlayId = this._overlayIds[element.id];

  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this._overlayIds[element.id];
};

ContextPads.prototype.get = function(element) {
  return this._overlayIds[element.id || element];
};

ContextPads.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'injector', 'canvas' ];