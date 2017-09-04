'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT;

function ExclusiveGatewayHandler(eventBus, animation) {
  this._eventBus = eventBus;
  this._animation = animation;
};

ExclusiveGatewayHandler.prototype.consume = function(element) {
  if (!element.tokenCount) {
    element.tokenCount = 0;
  }

  element.tokenCount++;

  var outgoing = element.outgoing,
      events = [];

  outgoing.forEach(function(outgoing) {
    var target = outgoing.target;

    if (is(target, 'bpmn:IntermediateCatchEvent')) {
      events.push(target);
    }
  });

  this._eventBus.fire(UPDATE_ELEMENTS_EVENT, {
    elements: events
  });
};

ExclusiveGatewayHandler.prototype.generate = function() {};

ExclusiveGatewayHandler.$inject = [ 'eventBus', 'animation' ];

module.exports = ExclusiveGatewayHandler;