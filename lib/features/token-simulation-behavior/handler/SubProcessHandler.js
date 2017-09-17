'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    UPDATE_ELEMENT_EVENT = events.UPDATE_ELEMENT_EVENT;

function SubProcessHandler(animation, eventBus, log) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._log = log;
};

SubProcessHandler.prototype.consume = function(context) {
  var element = context.element,
      processInstanceId = context.processInstanceId;

  var startEvent = element.children.filter(function(child) {
    return is(child, 'bpmn:StartEvent');
  })[0];

  if (!startEvent) {
    this._log.log('Skipping Subprocess', 'info', 'fa-angle-double-right');

    // skip subprocess
    this._eventBus.fire(GENERATE_TOKEN_EVENT, context);
  } else {
    this._log.log('Starting Subprocess', 'info', 'fa-sign-in');
    
    // start subprocess with process instance ID as parent process instance ID
    this._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: startEvent,
      parentProcessInstanceId: processInstanceId
    });
  }

  this._eventBus.fire(UPDATE_ELEMENT_EVENT, {
    element: element
  });
};

SubProcessHandler.prototype.generate = function(context) {
  var self = this;

  var element = context.element,
      processInstanceId = context.processInstanceId;
  
  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });
  
  outgoingSequenceFlows.forEach(function(outgoing) {
    self._animation.createAnimation(outgoing, processInstanceId, function() {
      self._eventBus.fire(CONSUME_TOKEN_EVENT, {
        element: outgoing.target,
        processInstanceId: processInstanceId
      });
    });
  });

  this._eventBus.fire(UPDATE_ELEMENT_EVENT, {
    element: element
  });
};

SubProcessHandler.$inject = [ 'animation', 'eventBus', 'log' ];

module.exports = SubProcessHandler;