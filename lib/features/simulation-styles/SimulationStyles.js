export default function SimulationStyles() {
  this._cache = {};
}

SimulationStyles.$inject = [];


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

  const element = typeof document !== 'undefined'
    ? document.documentElement
    : {};

  return get(element);
};


// helpers //////////////////

function getComputedStyleMock() {
  return {
    getPropertyValue() {
      return '';
    }
  };
}