import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const VERY_HIGH_PRIORITY = 50000;


export default function PreserveElementColors(
    eventBus, elementRegistry, graphicsFactory) {

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  this._elementColors = {};

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
    this._elementColors[element.id] = {
      stroke: element.businessObject.di.get('stroke'),
      fill: element.businessObject.di.get('fill')
    };

    this.setColor(element, '#000', '#fff');
  });
};

PreserveElementColors.prototype.resetColors = function() {
  const elementColors = this._elementColors;

  this._elementRegistry.forEach(element => {
    if (elementColors[element.id]) {
      this.setColor(element, elementColors[element.id].stroke, elementColors[element.id].fill);
    }
  });

  this._elementColors = {};
};

PreserveElementColors.prototype.setColor = function(element, stroke, fill) {
  const businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  const gfx = this._elementRegistry.getGraphics(element);

  const type = element.waypoints ? 'connection' : 'shape';

  this._graphicsFactory.update(type, element, gfx);
};

PreserveElementColors.$inject = [
  'eventBus',
  'elementRegistry',
  'graphicsFactory'
];