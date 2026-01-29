import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

import {
  domify
} from 'min-dom';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

const OFFSET_BOTTOM = 0;
const OFFSET_LEFT = 0;

// Color configuration
const EXECUTED_STROKE_COLOR = '#0f62fe';
const ACTIVE_STROKE_COLOR = '#0f62fe';

// Priority levels for element coloring
const EXECUTED_PRIORITY = 5000;
const ACTIVE_PRIORITY = 10000;

/**
 * Service for visualizing external execution data on BPMN diagram.
 * Applies visual styling to executed and active elements without simulation.
 */
export default function ExecutionVisualizer(elementRegistry, elementColors, eventBus, overlays) {
  this._elementRegistry = elementRegistry;
  this._elementColors = elementColors;
  this._eventBus = eventBus;
  this._overlays = overlays;

  this._completed = new Set();
  this._active = new Set();
  this._activeOverlayIds = new Map();

  // Clear execution state when mode is toggled off
  eventBus.on(TOGGLE_MODE_EVENT, event => {
    if (!event.active) {
      this.clear();
    }
  });
}

ExecutionVisualizer.$inject = [
  'elementRegistry',
  'elementColors',
  'eventBus',
  'overlays'
];

/**
 * Set the execution state by providing completed elements and active elements.
 *
 * @param {Object} state
 * @param {string[]} [state.completed] - Array of element IDs that have been completed (including sequence flows)
 * @param {string|string[]} [state.active] - ID(s) of the currently active element(s)
 */
ExecutionVisualizer.prototype.setExecutionState = function(state) {
  const {
    completed = [],
    active = []
  } = state;

  // Normalize active to array
  const activeArray = Array.isArray(active) ? active : (active ? [active] : []);

  // Clear previous active element styling
  this._active.forEach(id => {
    if (!activeArray.includes(id)) {
      const prevActiveEl = this._elementRegistry.get(id);
      if (prevActiveEl) {
        this._elementColors.remove(prevActiveEl, 'active');
      }
      this._removeActiveIndicator(id);
    }
  });

  // Clear previous completed elements that are no longer in the list
  this._completed.forEach(id => {
    if (!completed.includes(id)) {
      const element = this._elementRegistry.get(id);
      if (element) {
        this._elementColors.remove(element, 'executed');
      }
    }
  });

  // Update completed elements (including sequence flows)
  completed.forEach(id => {
    const element = this._elementRegistry.get(id);
    if (element && !activeArray.includes(id)) {
      this._elementColors.add(element, 'executed', {
        stroke: EXECUTED_STROKE_COLOR
      }, EXECUTED_PRIORITY);
    }
  });

  // Update active elements
  activeArray.forEach(id => {
    const activeEl = this._elementRegistry.get(id);
    if (activeEl) {
      this._elementColors.add(activeEl, 'active', {
        stroke: ACTIVE_STROKE_COLOR
      }, ACTIVE_PRIORITY);
      this._addActiveIndicator(activeEl, id);
    }
  });

  // Update internal state
  this._completed = new Set(completed);
  this._active = new Set(activeArray);

  // Fire event for integrations
  this._eventBus.fire('executionVisualizer.stateChanged', {
    completed,
    active: activeArray
  });
};

/**
 * Clear all execution visualization state.
 */
ExecutionVisualizer.prototype.clear = function() {
  this._completed.forEach(id => {
    const element = this._elementRegistry.get(id);
    if (element) {
      this._elementColors.remove(element, 'executed');
    }
  });

  // Remove active element colors
  this._active.forEach(id => {
    const activeEl = this._elementRegistry.get(id);
    if (activeEl) {
      this._elementColors.remove(activeEl, 'active');
    }
    this._removeActiveIndicator(id);
  });

  // Reset internal state
  this._completed.clear();
  this._active.clear();

  // Fire event
  this._eventBus.fire('executionVisualizer.cleared');
};

/**
 * Get the current execution state.
 *
 * @returns {Object}
 */
ExecutionVisualizer.prototype.getExecutionState = function() {
  return {
    completed: Array.from(this._completed),
    active: Array.from(this._active)
  };
};

/**
 * Add active indicator overlay to element.
 * @private
 */
ExecutionVisualizer.prototype._addActiveIndicator = function(element, elementId) {
  if (is(element, 'bpmn:SequenceFlow') || is(element, 'bpmn:MessageFlow')) {
    return;
  }

  // Skip if already exists
  if (this._activeOverlayIds.has(elementId)) {
    return;
  }

  const html = domify('<div class="bts-active-indicator"></div>');

  const position = { bottom: OFFSET_BOTTOM, right: OFFSET_LEFT };

  const overlayId = this._overlays.add(element, 'bts-active-indicator', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });

  this._activeOverlayIds.set(elementId, overlayId);
};

/**
 * Remove active indicator overlay.
 * @private
 */
ExecutionVisualizer.prototype._removeActiveIndicator = function(elementId) {
  if (this._activeOverlayIds.has(elementId)) {
    this._overlays.remove(this._activeOverlayIds.get(elementId));
    this._activeOverlayIds.delete(elementId);
  }
};
