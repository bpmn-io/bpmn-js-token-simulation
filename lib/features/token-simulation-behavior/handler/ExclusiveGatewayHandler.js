'use strict';

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function ExclusiveGatewayHandler(eventBus, animation, elementRegistry) {
  this._eventBus = eventBus;
  this._animation = animation;
  this._elementRegistry = elementRegistry;
};

ExclusiveGatewayHandler.prototype.consume = function(element) {
  if (!element.sequenceFlow) {
    throw new Error('no sequence flow configured for element ' + element.id);
  }

  this._eventBus.fire(GENERATE_TOKEN_EVENT, {
    element: element
  });
};

ExclusiveGatewayHandler.prototype.generate = function(element) {
  if (!element.sequenceFlow) {
    throw new Error('no sequence flow configured for element ' + element.id);
  }

  var self = this;

  // property could be changed during animation
  // therefore element.sequenceFlow can't be used
  var sequenceFlow = this._elementRegistry.get(element.sequenceFlow.id);

  this._animation.createAnimation(sequenceFlow, function() {
    self._eventBus.fire(CONSUME_TOKEN_EVENT, {
      element: sequenceFlow.target
    });
  });
};

ExclusiveGatewayHandler.$inject = [ 'eventBus', 'animation', 'elementRegistry' ];

module.exports = ExclusiveGatewayHandler;