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

  this._executedElements = new Set();
  this._activeElement = null;
  this._activeOverlayId = null;

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
 * Set the execution state by providing executed elements and active element.
 *
 * @param {Object} state
 * @param {string[]} [state.executedElements] - Array of element IDs that have been executed (including sequence flows)
 * @param {string} [state.activeElement] - ID of the currently active element
 */
ExecutionVisualizer.prototype.setExecutionState = function(state) {
  const {
    executedElements = [],
    activeElement = null
  } = state;

  // Clear previous active element styling
  if (this._activeElement) {
    const prevActiveEl = this._elementRegistry.get(this._activeElement);
    if (prevActiveEl) {
      this._elementColors.remove(prevActiveEl, 'active');
    }
    this._removeActiveIndicator();
  }

  // Clear previous executed elements that are no longer in the list
  this._executedElements.forEach(id => {
    if (!executedElements.includes(id)) {
      const element = this._elementRegistry.get(id);
      if (element) {
        this._elementColors.remove(element, 'executed');
      }
    }
  });

  // Update executed elements (including sequence flows)
  executedElements.forEach(id => {
    const element = this._elementRegistry.get(id);
    if (element && id !== activeElement) {
      this._elementColors.add(element, 'executed', {
        stroke: EXECUTED_STROKE_COLOR
      }, EXECUTED_PRIORITY);
    }
  });

  // Update active element
  if (activeElement) {
    const activeEl = this._elementRegistry.get(activeElement);
    if (activeEl) {
      this._elementColors.add(activeEl, 'active', {
        stroke: ACTIVE_STROKE_COLOR
      }, ACTIVE_PRIORITY);
      this._addActiveIndicator(activeEl);
    }
  }

  // Update internal state
  this._executedElements = new Set(executedElements);
  this._activeElement = activeElement;

  // Fire event for integrations
  this._eventBus.fire('executionVisualizer.stateChanged', {
    executedElements,
    activeElement
  });
};

/**
 * Clear all execution visualization state.
 */
ExecutionVisualizer.prototype.clear = function() {
  this._executedElements.forEach(id => {
    const element = this._elementRegistry.get(id);
    if (element) {
      this._elementColors.remove(element, 'executed');
    }
  });

  // Remove active element color
  if (this._activeElement) {
    const activeEl = this._elementRegistry.get(this._activeElement);
    if (activeEl) {
      this._elementColors.remove(activeEl, 'active');
    }
  }

  // Remove active indicator
  this._removeActiveIndicator();

  // Reset internal state
  this._executedElements.clear();
  this._activeElement = null;

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
    executedElements: Array.from(this._executedElements),
    activeElement: this._activeElement
  };
};

/**
 * Add active indicator overlay to element.
 * @private
 */
ExecutionVisualizer.prototype._addActiveIndicator = function(element) {
  if (is(element, 'bpmn:SequenceFlow') || is(element, 'bpmn:MessageFlow')) {
    return;
  }

  const html = domify('<div class="bts-active-indicator"></div>');

  const position = { bottom: OFFSET_BOTTOM, right: OFFSET_LEFT };

  this._activeOverlayId = this._overlays.add(element, 'bts-active-indicator', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

/**
 * Remove active indicator overlay.
 * @private
 */
ExecutionVisualizer.prototype._removeActiveIndicator = function() {
  if (this._activeOverlayId) {
    this._overlays.remove(this._activeOverlayId);
    this._activeOverlayId = null;
  }
};
