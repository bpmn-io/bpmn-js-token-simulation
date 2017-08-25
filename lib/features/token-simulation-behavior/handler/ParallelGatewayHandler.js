'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function ParallelGatewayHandler(animation, eventBus) {
  this._animation = animation;
  this._eventBus = eventBus;
};

ParallelGatewayHandler.prototype.consume = function(element) {
  if (!element.tokenCount) {
    element.tokenCount = 0;
  }

  element.tokenCount++;
  
  var incoming = element.incoming;
  
  if (incoming.length === element.tokenCount) {
    this._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
    
    element.tokenCount = 0;
  }
};

ParallelGatewayHandler.prototype.generate = function(element) {
  var self = this;
  
  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });
  
  outgoingSequenceFlows.forEach(function(connection) {
    self._animation.createAnimation(connection, function() {
      self._eventBus.fire(CONSUME_TOKEN_EVENT, {
        element: connection.target
      });
    });
  });
};

ParallelGatewayHandler.$inject = [ 'animation', 'eventBus' ];

module.exports = ParallelGatewayHandler;