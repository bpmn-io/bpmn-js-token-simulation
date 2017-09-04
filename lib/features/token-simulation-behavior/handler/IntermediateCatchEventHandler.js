'use strict';

var elementHelper = require('../../../util/ElementHelper'),
    is = elementHelper.is,
    getElementsInScope = elementHelper.getElementsInScope;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    UPDATE_ELEMENT_EVENT = events.UPDATE_ELEMENT_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT;

function IntermediateCatchEventHandler(animation, eventBus, elementRegistry) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
};

IntermediateCatchEventHandler.prototype.consume = function(element) {
  if (!element.tokenCount) {
    element.tokenCount = 0;
  }

  element.tokenCount++;

  this._eventBus.fire(UPDATE_ELEMENT_EVENT, {
    element: element
  });
};

IntermediateCatchEventHandler.prototype.generate = function(element) {
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

  var events = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:IntermediateCatchEvent');
  });

  var eventsInScope = getElementsInScope(events, element.parent);

  this._eventBus.fire(UPDATE_ELEMENTS_EVENT, {
    elements: eventsInScope
  });
};

IntermediateCatchEventHandler.$inject = [ 'animation', 'eventBus', 'elementRegistry' ];

module.exports = IntermediateCatchEventHandler;