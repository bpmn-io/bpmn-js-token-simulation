import {
  is
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

  this._overlaysByElement = new Map();

  this._handlers = [];

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', IntermediateCatchEventHandler);
  this.registerHandler('bpmn:ReceiveTask', IntermediateCatchEventHandler);

  // TODO(nikku): restore or delete
  // this.registerHandler('bpmn:SubProcess', ProcessHandler);

  this.registerHandler('bpmn:Activity', BoundaryEventHandler);

  this.registerHandler('bpmn:Process', StartEventHandler);
  this.registerHandler('bpmn:SubProcess', StartEventHandler);
  this.registerHandler('bpmn:Participant', StartEventHandler);

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
  const handler = this._injector.instantiate(handlerCls);

  this._handlers.push({ handler, type });
};

ContextPads.prototype.getHandlers = function(element) {

  return (
    this._handlers.filter(
      ({ type }) => is(element, type)
    ).map(
      ({ handler }) => handler
    )
  );
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

ContextPads.prototype.registerContextPad = function(element, overlayId) {

  const overlaysByElement = this._overlaysByElement;

  if (!overlaysByElement.has(element)) {
    overlaysByElement.set(element, []);
  }

  const overlayIds = overlaysByElement.get(element);

  overlayIds.push(overlayId);
};

ContextPads.prototype.openElementContextPads = function(element) {

  const contextPads = [];

  for (const handler of this.getHandlers(element)) {
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

    this.registerContextPad(element, overlayId);
  }
};

ContextPads.prototype.closeContextPads = function() {
  for (const element of this._overlaysByElement.keys()) {
    this.closeElementContextPads(element);
  }
};

ContextPads.prototype.closeElementContextPads = function(element) {

  const overlayIds = this._overlaysByElement.get(element) || [];

  for (const overlayId of overlayIds) {
    this._overlays.remove(overlayId);
  }

  overlayIds.length = 0;
};

ContextPads.$inject = [
  'eventBus',
  'elementRegistry',
  'overlays',
  'injector',
  'canvas'
];


// helpers ///////////////

export function isAncestor(ancestor, descendant) {

  do {
    if (ancestor === descendant) {
      return true;
    }

    descendant = descendant.parent;
  } while (descendant);

  return false;
}