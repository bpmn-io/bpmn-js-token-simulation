import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const VERY_HIGH_PRIORITY = 50000;


export default function PreserveElementColors(
    eventBus, elementRegistry, elementColors) {

  this._elementRegistry = elementRegistry;
  this._elementColors = elementColors;

  this._colorCache = {};

  eventBus.on(TOGGLE_MODE_EVENT, VERY_HIGH_PRIORITY, event => {
    const active = event.active;

    if (active) {
      this.preserveColors();
    } else {
      this.resetColors();
    }
  });
}

PreserveElementColors.prototype.preserveColors = function() {
  this._elementRegistry.forEach(element => {
    this._colorCache[element.id] = this._elementColors.get(element);

    this._elementColors.set(element, {
      stroke: '#000',
      fill: '#fff'
    });
  });
};

PreserveElementColors.prototype.resetColors = function() {
  this._elementRegistry.forEach(element => {

    const cachedColors = this._colorCache[element.id];

    if (cachedColors) {
      this._elementColors.set(element, cachedColors);
    }
  });

  this._colorCache = {};
};

PreserveElementColors.$inject = [
  'eventBus',
  'elementRegistry',
  'elementColors'
];