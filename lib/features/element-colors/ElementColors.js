import {
  getDi
} from 'bpmn-js/lib/util/ModelUtil';


export default function ElementColors(elementRegistry, graphicsFactory) {
  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
}

ElementColors.$inject = [
  'elementRegistry',
  'graphicsFactory'
];

ElementColors.prototype.get = function(element) {

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
  } else {
    return {
      fill: di.get('background-color'),
      stroke: di.get('border-color')
    };
  }
};

ElementColors.prototype.set = function(element, colors) {

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
  } else {
    di.set('background-color', fill);
    di.set('border-color', stroke);
  }

  this._forceRedraw(element);
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