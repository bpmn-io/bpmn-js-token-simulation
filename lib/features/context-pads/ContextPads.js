import {
  is
} from '../../util/ElementHelper';

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  ELEMENT_CHANGED_EVENT,
  SCOPE_FILTER_CHANGED_EVENT
} from '../../util/EventHelper';

import {
  event as domEvent,
  classes as domClasses,
  queryAll as domQueryAll,
  domify
} from 'min-dom';

import BoundaryEventHandler from './handler/BoundaryEventHandler';
import ExclusiveGatewayHandler from './handler/ExclusiveGatewayHandler';
import EventBasedGatewayHandler from './handler/EventBasedGatewayHandler';
import ContinueHandler from './handler/ContinueHandler';
import StartEventHandler from './handler/StartEventHandler';
import PauseHandler from './handler/PauseHandler';


const LOW_PRIORITY = 500;

const OFFSET_TOP = -15;
const OFFSET_LEFT = -15;


export default function ContextPads(
    eventBus, elementRegistry,
    overlays, injector,
    canvas, scopeFilter) {

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._injector = injector;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._overlaysByElement = new Map();

  this._handlerIdx = 0;

  this._handlers = [];

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', ContinueHandler);
  this.registerHandler('bpmn:Activity', ContinueHandler);

  this.registerHandler('bpmn:EventBasedGateway', EventBasedGatewayHandler);

  this.registerHandler('bpmn:Activity', BoundaryEventHandler);

  this.registerHandler('bpmn:Process', StartEventHandler);
  this.registerHandler('bpmn:SubProcess', StartEventHandler);
  this.registerHandler('bpmn:Participant', StartEventHandler);
  this.registerHandler('bpmn:Activity', PauseHandler);

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

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    const contextPads = domQueryAll(
      '.djs-overlay-ts-context-menu [data-scope-ids]',
      overlays._overlayRoot
    );

    for (const element of contextPads) {

      const scopeIds = element.dataset.scopeIds.split(',');

      const shown = scopeIds.some(id => scopeFilter.isShown(id));

      domClasses(element).toggle('hidden', !shown);
    }
  });

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {
    const {
      element
    } = event;

    this.updateElementContextPads(element);
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

  handler.hash = String(this._handlerIdx++);

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
      this.updateElementContextPads(element);
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

ContextPads.prototype.updateElementContextPads = function(element) {
  for (const handler of this.getHandlers(element)) {
    this._updateElementContextPads(element, handler);
  }
};

ContextPads.prototype._updateElementContextPads = function(element, handler) {

  const contextPads = (handler.createContextPads(element) || []).filter(p => p);

  const type = `ts-context-pad---${element.id}---${handler.hash}`;

  const existingOverlays = this._overlays.get({ type });

  const updatedOverlays = [];

  for (const contextPad of contextPads) {

    const {
      element,
      scopes: _scopes,
      action: _action,
      html: _html
    } = contextPad;


    const hash = `${contextPad.element.id}-------${_html}`;

    let existingOverlay = existingOverlays.find(
      o => o.hash === hash
    );

    const html = existingOverlay && existingOverlay.html || domify(_html);

    if (_scopes) {
      const scopes = _scopes();

      html.dataset.scopeIds = scopes.map(s => s.id).join(',');

      const shownScopes = scopes.filter(s => this._scopeFilter.isShown(s));

      domClasses(html).toggle('hidden', shownScopes.length === 0);
    }

    if (existingOverlay) {
      updatedOverlays.push(existingOverlay);

      continue;
    }

    if (_action) {

      domEvent.bind(html, 'click', event => {
        event.preventDefault();

        const scopes = _scopes
          ? _scopes().filter(s => this._scopeFilter.isShown(s))
          : null;

        _action(scopes);
      });
    }

    const overlayId = this._overlays.add(contextPad.element, type, {
      position: {
        top: OFFSET_TOP,
        left: OFFSET_LEFT
      },
      html,
      hash,
      show: {
        minZoom: 0.5
      }
    });

    this.registerContextPad(element, overlayId);
  }

  for (const existingOverlay of existingOverlays) {
    if (!updatedOverlays.includes(existingOverlay)) {
      this._overlays.remove(existingOverlay.id);
    }
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
  'canvas',
  'scopeFilter'
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