'use strict';

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function TaskHandler(animation, eventBus) {
  this._animation = animation;
  this._eventBus = eventBus;
}

TaskHandler.prototype.consume = function(context) {

  // fire to generate token on self
  this._eventBus.fire(GENERATE_TOKEN_EVENT, context);
};

TaskHandler.prototype.generate = function(context) {
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
};

TaskHandler.$inject = [ 'animation', 'eventBus' ];

module.exports = TaskHandler;