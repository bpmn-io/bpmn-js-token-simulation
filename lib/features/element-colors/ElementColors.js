export default function ElementColors(elementRegistry, graphicsFactory) {
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
}

ElementColors.$inject = [
  'elementRegistry',
  'graphicsFactory'
];

ElementColors.prototype.get = function(element) {

  const fill = element.businessObject.di.get('fill');
  const stroke = element.businessObject.di.get('stroke');

  return {
    fill,
    stroke
  };
};

ElementColors.prototype.set = function(element, colors) {

  const {
    fill,
    stroke
  } = colors;

  element.businessObject.di.set('stroke', stroke);
  element.businessObject.di.set('fill', fill);

  this._forceRedraw(element);
};

ElementColors.prototype._forceRedraw = function(element) {
  const gfx = this._elementRegistry.getGraphics(element);
  const type = element.waypoints ? 'connection' : 'shape';

  this._graphicsFactory.update(type, element, gfx);
};