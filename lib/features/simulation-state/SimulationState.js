'use strict';

var is = require('../../util/ElementHelper').is;

var events = require('../../util/EventHelper'),
  TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
  CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT;

var LOW_PRIORITY = 500;

function SimulationState(eventBus, animation, elementRegistry, log, elementNotifications) {
  var self = this;

  this._animation = animation;
  this._elementRegistry = elementRegistry;
  this._log = log;
  this._elementNotifications = elementNotifications;

  eventBus.on(CONSUME_TOKEN_EVENT, LOW_PRIORITY, function(context) {
    var element = context.element;

    if (is(element, 'bpmn:EndEvent')) {
      self.isFinished(element);
    }

    self.isDeadlock();
    
  });
}

SimulationState.prototype.isDeadlock = function() {
  var self = this;

  var hasTokens = [];
  
  this._elementRegistry.forEach(function(element) {
    if (element.tokenCount) {
      hasTokens.push(element);
    }
  });

  var cannotContinue = [];

  hasTokens.forEach(function(element) {
    var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
      return is(outgoing, 'bpmn:SequenceFlow');
    });

    // has tokens but no outgoing sequence flows
    if (!outgoingSequenceFlows.length) {
      cannotContinue.push(element);
    }

    // parallel gateway after exclusive gateway
    if (is(element, 'bpmn:ParallelGateway')) {
      var incomingSequenceFlows = element.incoming.filter(function(incoming) {
        return is(incoming, 'bpmn:SequenceFlow');
      });

      if (incomingSequenceFlows.length > element.tokenCount) {
        cannotContinue.push(element);
      }
    }

  });

  var hasAnimations = this._animation.animations.length;

  if (hasTokens.length && cannotContinue.length && !this._animation.animations.length) {
    self._log.log('Deadlock', 'warning', 'fa-exclamation-triangle');

    cannotContinue.forEach(function(element) {
      self._elementNotifications.addElementNotification(element, {
        type: 'warning',
        icon: 'fa-exclamation-triangle',
        text: 'Deadlock'
      });
    });
  }
};

SimulationState.prototype.isFinished = function(element) {
  var hasTokens = false;
  
  this._elementRegistry.forEach(function(element) {
    if (element.tokenCount) {
      hasTokens = true;
    }
  });

  if (!hasTokens && !this._animation.animations.length) {
    this._log.log('Process finished', 'success', 'fa-check-circle');

    this._elementNotifications.addElementNotification(element, {
      type: 'success',
      icon: 'fa-check-circle',
      text: 'Finished'
    });
  }
};

SimulationState.$inject = [ 
  'eventBus',
  'animation',
  'elementRegistry',
  'log',
  'elementNotifications'
];

module.exports = SimulationState;