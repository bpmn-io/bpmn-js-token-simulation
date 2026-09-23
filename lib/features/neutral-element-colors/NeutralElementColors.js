import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const ID = 'neutral-element-colors';

const STROKE_COLOR = '--token-simulation-element-stroke-color';
const FILL_COLOR = '--token-simulation-element-fill-color';

export default function NeutralElementColors(
    eventBus, elementRegistry, elementColors, simulationStyles) {

  this._elementRegistry = elementRegistry;
  this._elementColors = elementColors;
  this._simulationStyles = simulationStyles;

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    const { active } = event;

    if (active) {
      this._setNeutralColors();
    }
  });
}

NeutralElementColors.prototype._setNeutralColors = function() {
  const stroke = this._simulationStyles.get(STROKE_COLOR),
        fill = this._simulationStyles.get(FILL_COLOR);

  this._elementRegistry.forEach(element => {
    this._elementColors.add(element, ID, {
      stroke,
      fill
    });
  });
};

NeutralElementColors.$inject = [
  'eventBus',
  'elementRegistry',
  'elementColors',
  'simulationStyles'
];