'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT;

function StartEventHandler(animation, eventBus, elementRegistry) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
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

  if (is(element.parent, 'bpmn:SubProcess')) {
    return;
  }

  var startEvents = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:StartEvent');
  });

  this._eventBus.fire(UPDATE_ELEMENTS_EVENT, {
    elements: startEvents
  });
};

StartEventHandler.$inject = [ 'animation', 'eventBus', 'elementRegistry' ];

module.exports = StartEventHandler;