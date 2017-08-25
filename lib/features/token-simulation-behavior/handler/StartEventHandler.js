'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT;

function StartEventHandler(animation, eventBus) {
  this._animation = animation;
  this._eventBus = eventBus;
};

StartEventHandler.prototype.consume = function(element) {};

StartEventHandler.prototype.generate = function(element) {
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

StartEventHandler.$inject = [ 'animation', 'eventBus' ];

module.exports = StartEventHandler;