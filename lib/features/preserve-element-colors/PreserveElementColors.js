'use strict';

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var VERY_HIGH_PRIORITY = 50000;

function PreserveElementColors(eventBus, elementRegistry, graphicsFactory) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  this.elementColors = {};

  eventBus.on(TOGGLE_MODE_EVENT, VERY_HIGH_PRIORITY, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.resetColors();
    } else {
      self.preserveColors();
    }
  });
}

PreserveElementColors.prototype.preserveColors = function() {
  var self = this;

  this._elementRegistry.forEach(function(element) {
    self.elementColors[element.id] = {
      stroke: element.businessObject.di.get('stroke'),
      fill: element.businessObject.di.get('fill')
    };

    self.setColor(element, '#000', '#fff');
  });
};

PreserveElementColors.prototype.resetColors = function() {
  var self = this;

  this._elementRegistry.forEach(function(element) {
    if (self.elementColors[element.id]) {
      self.setColor(element, self.elementColors[element.id].stroke, self.elementColors[element.id].fill);
    }
  });

  this.elementColors = {};
};

PreserveElementColors.prototype.setColor = function(element, stroke, fill) {
  var businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  var gfx = this._elementRegistry.getGraphics(element);

  var type = element.waypoints ? 'connection' : 'shape';

  this._graphicsFactory.update(type, element, gfx);
};

PreserveElementColors.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = PreserveElementColors;