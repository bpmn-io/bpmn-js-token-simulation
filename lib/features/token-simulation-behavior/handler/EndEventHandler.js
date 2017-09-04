'use strict';

var elementHelper = require('../../../util/ElementHelper'),
    getBusinessObject = elementHelper.getBusinessObject,
    is = elementHelper.is,
    isParent = elementHelper.isParent,
    getElementsInScope = elementHelper.getElementsInScope,
    isTypedEvent = elementHelper.isTypedEvent;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    TERMINATE_EVENT = events.TERMINATE_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT;

function EndEventHandler(animation, eventBus, log, simulationState, elementRegistry) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._log = log;
  this._simulationState = simulationState;
  this._elementRegistry = elementRegistry;
};

EndEventHandler.prototype.consume = function(element) {
  var isTerminate = isTypedEvent(getBusinessObject(element), 'bpmn:TerminateEventDefinition'),
      isSubProcessChild = is(element.parent, 'bpmn:SubProcess');

  if (isTerminate) {
    this._eventBus.fire(TERMINATE_EVENT, {
      element: element
    });

    this._elementRegistry.forEach(function(e) {
      if (isParent(element.parent, e) && e.tokenCount !== undefined) {
        delete e.tokenCount;
      }
    });
  }

  var isFinished = this._simulationState.isFinished(element, element.parent);

  if ((isFinished || isTerminate) && isSubProcessChild) {
    this._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
  }

  this._eventBus.fire(UPDATE_ELEMENTS_EVENT, {
    elements: getElementsInScope(this._elementRegistry.getAll(), element.parent)
  });
};

EndEventHandler.prototype.generate = function(element) {
  var self = this;
  
  if (!is(element.parent, 'bpmn:SubProcess')) {
    return;
  }

  // continue in outer scope
  var outgoingSequenceFlows = element.parent.outgoing.filter(function(outgoing) {
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

EndEventHandler.$inject = [ 'animation', 'eventBus', 'log', 'simulationState', 'elementRegistry' ];

module.exports = EndEventHandler;