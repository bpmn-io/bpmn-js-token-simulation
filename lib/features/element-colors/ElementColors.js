import {
  getDi,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const VERY_HIGH_PRIORITY = 50000;

/**
 * @typedef Colors
 * @prop {string} fill
 * @prop {string} stroke
 */

/**
 * @typedef CustomColors
 * @prop {string} fill
 * @prop {string} stroke
 * @prop {number} priority
 */

export default function ElementColors(elementRegistry, eventBus, graphicsFactory) {
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;
  this._graphicsFactory = graphicsFactory;

  this._originalColors = {};
  this._customColors = {};

  eventBus.on(TOGGLE_MODE_EVENT, VERY_HIGH_PRIORITY, event => {
    const active = event.active;

    if (active) {
      this._saveOriginalColors();
    } else {
      this._applyOriginalColors();

      this._originalColors = {};
      this._customColors = {};
    }
  });

  eventBus.on('saveXML.start', VERY_HIGH_PRIORITY, () => {
    this._applyOriginalColors();

    eventBus.once('saveXML.done', () => this._applyCustomColors());
  });
}

ElementColors.$inject = [
  'elementRegistry',
  'eventBus',
  'graphicsFactory'
];

/**
 * Add colors to an element. Element will be redrawn with highest priority
 * colors.
 *
 * @param {Object} element
 * @param {string} id
 * @param {Colors} colors
 * @param {number} [priority=1000]
 */
ElementColors.prototype.add = function(element, id, colors, priority = 1000) {
  let elementColors = this._customColors[ element.id ];

  if (!elementColors) {
    elementColors = this._customColors[ element.id ] = {};
  }

  elementColors[ id ] = {
    ...colors,
    priority
  };

  this._applyHighestPriorityColor(element);
};


/**
 * Remove colors from an element. Element will be redrawn with highest priority
 * colors.
 *
 * @param {Object} element
 * @param {string} id
 */
ElementColors.prototype.remove = function(element, id) {
  const elementColors = this._customColors[ element.id ];

  if (elementColors) {
    delete elementColors[ id ];

    if (!Object.keys(elementColors)) {
      delete this._customColors[ element.id ];
    }
  }

  this._applyHighestPriorityColor(element);
};

ElementColors.prototype._get = function(element) {
  const di = getDi(element);

  if (!di) {
    return undefined;
  }

  // reading in accordance with bpmn-js@8.7+,
  // BPMN-in-Color specification
  if (isLabel(element)) {
    return {
      stroke: di.label && di.label.get('color')
    };
  } else if (isAny(di, [ 'bpmndi:BPMNEdge', 'bpmndi:BPMNShape' ])) {
    return {
      fill: di.get('background-color'),
      stroke: di.get('border-color')
    };
  }
};

ElementColors.prototype._set = function(element, colors = {}) {
  const {
    fill,
    stroke
  } = colors;

  const di = getDi(element);

  if (!di) {
    return;
  }

  // writing in accordance with bpmn-js@8.7+,
  // BPMN-in-Color specification
  if (isLabel(element)) {
    di.label && di.label.set('color', stroke);
  } else if (isAny(di, [ 'bpmndi:BPMNEdge', 'bpmndi:BPMNShape' ])) {
    di.set('background-color', fill);
    di.set('border-color', stroke);
  }

  this._forceRedraw(element);
};

ElementColors.prototype._saveOriginalColors = function() {
  this._originalColors = {};

  this._elementRegistry.forEach(element => {
    this._originalColors[ element.id ] = this._get(element);
  });
};

ElementColors.prototype._applyOriginalColors = function() {
  this._elementRegistry.forEach(element => {
    const colors = this._originalColors[ element.id ];

    if (colors) {
      this._set(element, colors);
    }
  });
};

ElementColors.prototype._applyCustomColors = function() {
  this._elementRegistry.forEach(element => {
    const elementColors = this._customColors[ element.id ];

    if (elementColors) {
      this._set(element, getColorsWithHighestPriority(elementColors));
    }
  });
};

ElementColors.prototype._applyHighestPriorityColor = function(element) {
  const elementColors = this._customColors[ element.id ];

  if (!elementColors) {
    this._set(element, this._originalColors[ element.id ]);

    return;
  }

  this._set(element, getColorsWithHighestPriority(elementColors));
};

ElementColors.prototype._forceRedraw = function(element) {
  const gfx = this._elementRegistry.getGraphics(element);

  const type = element.waypoints ? 'connection' : 'shape';

  this._graphicsFactory.update(type, element, gfx);
};


// helpers /////////////////

function isLabel(element) {
  return 'labelTarget' in element;
}

/**
 * Get colors with highest priority.
 *
 * @param {Map<string, CustomColors>|undefined} colors
 *
 * @returns {Colors|undefined}
 */
function getColorsWithHighestPriority(colors = {}) {
  const colorsWithHighestPriority = Object.values(colors).reduce((colorsWithHighestPriority, colors) => {
    const { priority = 1000 } = colors;

    if (!colorsWithHighestPriority || priority > colorsWithHighestPriority.priority) {
      return colors;
    }

    return colorsWithHighestPriority;
  }, undefined);

  if (colorsWithHighestPriority) {
    const { priority, ...fillAndStroke } = colorsWithHighestPriority;

    return fillAndStroke;
  }
}