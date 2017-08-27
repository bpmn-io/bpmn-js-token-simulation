'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function SubProcessHandler(animation, eventBus, log) {
  this._animation = animation;
  this._eventBus = eventBus;
  this._log = log;
};

SubProcessHandler.prototype.consume = function(element) {
  var startEvent = element.children.filter(function(child) {
    return is(child, 'bpmn:StartEvent');
  })[0];

  if (!startEvent) {
    this._log.log('Skipping Subprocess', 'info', 'fa-angle-double-right');

    // skip subprocess
    this._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
  } else {
    this._log.log('Starting Subprocess', 'info', 'fa-sign-in');
    
    // start subprocess
    this._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: startEvent
    });
  }
};

SubProcessHandler.prototype.generate = function(element) {
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

SubProcessHandler.$inject = [ 'animation', 'eventBus', 'log' ];

module.exports = SubProcessHandler;