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

import ExclusiveGatewayHandler from './handler/ExclusiveGatewayHandler';
import PauseHandler from './handler/PauseHandler';
import TriggerHandler from './handler/TriggerHandler';


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

  this._overlayCache = new Map();

  this._handlerIdx = 0;

  this._handlers = [];

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);

  this.registerHandler('bpmn:Activity', PauseHandler);

  this.registerHandler('bpmn:StartEvent', TriggerHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', TriggerHandler);
  this.registerHandler('bpmn:BoundaryEvent', TriggerHandler);
  this.registerHandler('bpmn:Activity', TriggerHandler);

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

    const showElements = domQueryAll(
      '.djs-overlay-ts-context-menu [data-scope-ids]',
      overlays._overlayRoot
    );

    for (const element of showElements) {

      const scopeIds = element.dataset.scopeIds.split(',');

      const shown = scopeIds.some(id => scopeFilter.isShown(id));

      domClasses(element).toggle('hidden', !shown);
    }

    const hideElements = domQueryAll(
      '.djs-overlay-ts-context-menu [data-hide-scope-ids]',
      overlays._overlayRoot
    );

    for (const element of hideElements) {

      const scopeIds = element.dataset.hideScopeIds.split(',');

      const shown = scopeIds.some(id => scopeFilter.isShown(id));

      domClasses(element).toggle('hidden', shown);
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

ContextPads.prototype._getOverlays = function(hash) {
  return this._overlayCache.get(hash) || [];
};

ContextPads.prototype._addOverlay = function(element, options) {

  const {
    handlerHash
  } = options;

  if (!handlerHash) {
    throw new Error('<handlerHash> required');
  }

  const overlayId = this._overlays.add(element, 'ts-context-menu', {
    ...options,
    position: {
      top: OFFSET_TOP,
      left: OFFSET_LEFT
    },
    show: {
      minZoom: 0.5
    }
  });

  const overlay = this._overlays.get(overlayId);

  const overlayCache = this._overlayCache;

  if (!overlayCache.has(handlerHash)) {
    overlayCache.set(handlerHash, []);
  }

  overlayCache.get(handlerHash).push(overlay);
};

ContextPads.prototype._removeOverlay = function(overlay) {

  const {
    id,
    handlerHash
  } = overlay;

  // remove overlay
  this._overlays.remove(id);

  // remove from overlay cache
  const overlays = this._overlayCache.get(handlerHash) || [];

  const idx = overlays.indexOf(overlay);

  if (idx !== -1) {
    overlays.splice(idx, 1);
  }
};

ContextPads.prototype.updateElementContextPads = function(element) {
  for (const handler of this.getHandlers(element)) {
    this._updateElementContextPads(element, handler);
  }
};

ContextPads.prototype._updateElementContextPads = function(element, handler) {

  const contextPads = (handler.createContextPads(element) || []).filter(p => p);

  const handlerHash = `${element.id}------${handler.hash}`;

  const existingOverlays = this._getOverlays(handlerHash);

  const updatedOverlays = [];

  for (const contextPad of contextPads) {

    const {
      element,
      contexts: _contexts,
      hideContexts: _hideContexts,
      action: _action,
      html: _html
    } = contextPad;


    const hash = `${contextPad.element.id}-------${_html}`;

    let existingOverlay = existingOverlays.find(
      o => o.hash === hash
    );

    const html = existingOverlay && existingOverlay.html || domify(_html);

    if (_contexts) {
      const contexts = _contexts();

      html.dataset.scopeIds = contexts.map(c => c.scope.id).join(',');

      const shownScopes = contexts.filter(c => this._scopeFilter.isShown(c.scope));

      domClasses(html).toggle('hidden', shownScopes.length === 0);
    }

    if (_hideContexts) {
      const contexts = _hideContexts();

      html.dataset.hideScopeIds = contexts.map(c => c.scope.id).join(',');

      const shownScopes = contexts.filter(c => this._scopeFilter.isShown(c.scope));

      domClasses(html).toggle('hidden', shownScopes.length > 0);
    }

    if (existingOverlay) {
      updatedOverlays.push(existingOverlay);

      continue;
    }

    if (_action) {

      domEvent.bind(html, 'click', event => {
        event.preventDefault();

        const contexts = _contexts
          ? _contexts().filter(c => this._scopeFilter.isShown(c.scope))
          : null;

        _action(contexts);
      });
    }

    this._addOverlay(element, {
      hash,
      handlerHash,
      html
    });
  }

  for (const existingOverlay of existingOverlays) {
    if (!updatedOverlays.includes(existingOverlay)) {
      this._removeOverlay(existingOverlay);
    }
  }
};

ContextPads.prototype.closeContextPads = function() {
  for (const overlays of this._overlayCache.values()) {

    for (const overlay of overlays) {
      this._closeOverlay(overlay);
    }
  }

  this._overlayCache.clear();
};

ContextPads.prototype._closeOverlay = function(overlay) {
  this._overlays.remove(overlay.id);
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