import {
  isPlane
} from 'bpmn-js/lib/util/DrilldownUtil';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

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


const LOW_PRIORITY = 500;

const OFFSET_TOP = -15;
const OFFSET_LEFT = -15;


export default function ContextPads(
    eventBus, elementRegistry,
    overlays,
    canvas, scopeFilter, elementOrder) {

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;
  this._elementOrder = elementOrder;

  this._active = false;
  this._contextPadsOpen = false;

  this._overlayCache = new Map();

  this._handlerIdx = 0;

  this._handlers = [];

  eventBus.on(TOGGLE_MODE_EVENT, LOW_PRIORITY, context => {
    this._active = context.active;

    if (this._active) {
      this.openContextPads();
    } else {
      this.closeContextPads();
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    this.closeContextPads();
    this.openContextPads();
  });

  eventBus.on('root.set', LOW_PRIORITY, () => {
    if (this._active) {
      this.openContextPads();
    } else {
      this.closeContextPads();
    }
  });

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    const showElements = domQueryAll(
      '.djs-overlay-bts-context-menu [data-scope-ids]',
      overlays._overlayRoot
    );

    for (const element of showElements) {

      const scopeIds = element.dataset.scopeIds.split(',');

      const shown = scopeIds.some(id => scopeFilter.isShown(id));

      domClasses(element).toggle('hidden', !shown);
    }

    const hideElements = domQueryAll(
      '.djs-overlay-bts-context-menu [data-hide-scope-ids]',
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

    // Skip updates until openContextPads has established
    // the correct DFS-based DOM order.
    if (this._contextPadsOpen) {
      this.updateElementContextPads(element);
    }
  });
}

/**
 * Register a handler for an element type.
 * An element type can have multiple handlers.
 * Called by handlers themselves in their constructors.
 *
 * @param {String} type
 * @param {Object} handler - handler instance
 */
ContextPads.prototype.register = function(type, handler) {
  this._handlers.push({ handler, type, id: String(this._handlerIdx++) });
};

ContextPads.prototype.getHandlers = function(element) {
  return this._handlers.filter(({ type }) => is(element, type));
};

ContextPads.prototype.openContextPads = function(parent) {

  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  const ordered = this._elementOrder.getOrderedElements(parent);

  for (const element of ordered) {
    if (!isPlane(element)) {
      this.updateElementContextPads(element);
    }
  }

  this._contextPadsOpen = true;
};

ContextPads.prototype._getOverlays = function(cacheKey) {
  return this._overlayCache.get(cacheKey) || [];
};

ContextPads.prototype._addOverlay = function(element, options) {

  const {
    cacheKey
  } = options;

  if (!cacheKey) {
    throw new Error('<cacheKey> required');
  }

  const overlayId = this._overlays.add(element, 'bts-context-menu', {
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

  if (!overlayCache.has(cacheKey)) {
    overlayCache.set(cacheKey, []);
  }

  overlayCache.get(cacheKey).push(overlay);
};

ContextPads.prototype._removeOverlay = function(overlay) {

  const {
    id,
    cacheKey
  } = overlay;

  // remove overlay
  this._overlays.remove(id);

  // remove from overlay cache
  const overlays = this._overlayCache.get(cacheKey) || [];

  const idx = overlays.indexOf(overlay);

  if (idx !== -1) {
    overlays.splice(idx, 1);
  }
};

ContextPads.prototype.updateElementContextPads = function(element) {
  for (const handlerRegistration of this.getHandlers(element)) {
    this._updateElementContextPads(element, handlerRegistration);
  }
};

ContextPads.prototype._updateElementContextPads = function(element, handlerRegistration) {

  const canvas = this._canvas;

  const { handler, id: registrationId } = handlerRegistration;

  const contextPads = (handler.createContextPads(element) || []).filter(p => p);

  const cacheKey = `${element.id}|${registrationId}`;

  const existingOverlays = this._getOverlays(cacheKey);

  const updatedOverlays = [];

  for (const contextPad of contextPads) {

    const {
      element,
      contexts: _contexts,
      hideContexts: _hideContexts,
      action: _action,
      html: _html,
      key: _key,
      update: _update
    } = contextPad;


    const padKey = _key
      ? `${contextPad.element.id}|${_key}`
      : `${contextPad.element.id}|${_html}`;

    let existingOverlay = existingOverlays.find(
      o => o.padKey === padKey
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
      if (_update) {
        _update(existingOverlay.html);
      }

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

        if ('restoreFocus' in canvas) {
          canvas.restoreFocus();
        }
      });
    }

    this._addOverlay(element, {
      padKey,
      cacheKey,
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
  this._contextPadsOpen = false;

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
  'canvas',
  'scopeFilter',
  'elementOrder'
];
