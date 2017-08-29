'use strict';

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function ExclusiveGatewayHandler(eventBus, animation) {
  this._eventBus = eventBus;
  this._animation = animation;
};

ExclusiveGatewayHandler.prototype.consume = function(element) {
  if (!element.tokenCount) {
    element.tokenCount = 0;
  }

  element.tokenCount++;
};

ExclusiveGatewayHandler.prototype.generate = function() {};

ExclusiveGatewayHandler.$inject = [ 'eventBus', 'animation' ];

module.exports = ExclusiveGatewayHandler;