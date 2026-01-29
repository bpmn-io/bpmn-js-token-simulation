import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const ID = 'neutral-element-colors';

export default function NeutralElementColors(
    eventBus, elementRegistry, elementColors) {

  this._elementRegistry = elementRegistry;
  this._elementColors = elementColors;

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    const { active } = event;

    if (active) {
      this._setNeutralColors();
    } else {
      this._removeNeutralColors();
    }
  });
}

NeutralElementColors.prototype._setNeutralColors = function() {
  this._elementRegistry.forEach(element => {
    this._elementColors.add(element, ID, {
      stroke: '#212121',
      fill: '#fff'
    });
  });
};

NeutralElementColors.prototype._removeNeutralColors = function() {
  this._elementRegistry.forEach(element => {
    this._elementColors.remove(element, ID);
  });
};

NeutralElementColors.$inject = [
  'eventBus',
  'elementRegistry',
  'elementColors'
];