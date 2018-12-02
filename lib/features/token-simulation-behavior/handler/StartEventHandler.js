'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT;

function StartEventHandler(animation, eventBus, elementRegistry, processInstances) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._processInstances = processInstances;
}

/**
 * Start event has no incoming sequence flows.
 * Therefore it can never consume.
 */
StartEventHandler.prototype.consume = function() {};

/**
 * Generate tokens for start event that was either
 * invoked by user or a parent process.
 *
 * @param {Object} context - The context.
 * @param {Object} context.element - The element.
 * @param {string} [context.parentProcessInstanceId] - Optional ID of parent process when invoked by parent process.
 *
 */
StartEventHandler.prototype.generate = function(context) {
  var self = this;

  var element = context.element,
      parentProcessInstanceId = context.parentProcessInstanceId;

  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  // create new process instance
  var parent = element.parent,
      processInstanceId = this._processInstances.create(parent, parentProcessInstanceId);

  outgoingSequenceFlows.forEach(function(connection) {
    self._animation.createAnimation(connection, processInstanceId, function() {
      self._eventBus.fire(CONSUME_TOKEN_EVENT, {
        element: connection.target,
        processInstanceId: processInstanceId
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

StartEventHandler.$inject = [ 'animation', 'eventBus', 'elementRegistry', 'processInstances' ];

module.exports = StartEventHandler;