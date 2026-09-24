import {
  classes as domClasses
} from 'min-dom';

export const CONTAINER_CLASS = 'bts-container';

/**
 * Owns the extension's styling root: marks the canvas container so the
 * stylesheet declares its variables on a class this extension owns, and
 * resolves them from there.
 *
 * @param { import('diagram-js/lib/core/Canvas').default } canvas
 */
export default function SimulationStyles(canvas) {
  this._canvas = canvas;
  this._cache = {};

  domClasses(canvas.getContainer()).add(CONTAINER_CLASS);
}

SimulationStyles.$inject = [ 'canvas' ];


SimulationStyles.prototype.get = function(prop) {

  const cachedValue = this._cache[prop];

  if (cachedValue) {
    return cachedValue;
  }

  if (!this._computedStyle) {
    this._computedStyle = this._getComputedStyle();
  }

  return this._cache[prop] = this._computedStyle.getPropertyValue(prop).trim();
};

SimulationStyles.prototype._getComputedStyle = function() {

  const get = typeof getComputedStyle === 'function'
    ? getComputedStyle
    : getComputedStyleMock;

  // the variables are declared on the bpmn-js container
  return get(this._canvas.getContainer());
};


// helpers //////////////////

function getComputedStyleMock() {
  return {
    getPropertyValue() {
      return '';
    }
  };
}