'use strict';

var elementHelper = require('../../util/ElementHelper'),
    getBusinessObject = elementHelper.getBusinessObject,
    is = elementHelper.is,
    isAncestor = elementHelper.isAncestor,
    isTypedEvent = elementHelper.isTypedEvent;

var events = require('../../util/EventHelper'),
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT;

var VERY_LOW_PRIORITY = 250;

function SimulationState(
    eventBus,
    animation,
    elementRegistry,
    log,
    elementNotifications,
    canvas,
    processInstances
) {

  // var self = this;

  this._animation = animation;
  this._elementRegistry = elementRegistry;
  this._log = log;
  this._elementNotifications = elementNotifications;
  this._canvas = canvas;
  this._processInstances = processInstances;

  eventBus.on(CONSUME_TOKEN_EVENT, VERY_LOW_PRIORITY, function() {

    // self.isDeadlock();
  });
}

// TODO: refactor
SimulationState.prototype.isDeadlock = function() {
  var self = this;

  var hasTokens = [];

  this._elementRegistry.forEach(function(element) {
    if (element.tokenCount) {
      hasTokens.push(element);
    }
  });

  var cannotContinue = [];
  var hasTerminate = [];

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

    var visited = [];

    // has terminate event
    function checkIfHasTerminate(element) {
      element.outgoing.forEach(function(outgoing) {
        if (visited.indexOf(outgoing.target) !== -1) {
          return;
        }

        visited.push(outgoing.target);

        var isTerminate = isTypedEvent(getBusinessObject(outgoing.target), 'bpmn:TerminateEventDefinition');

        if (isTerminate) {
          hasTerminate.push(element);
        }

        checkIfHasTerminate(outgoing.target);
      });
    }

    checkIfHasTerminate(element);
  });

  if (hasTokens.length
      && !hasTerminate.length
      && cannotContinue.length
      && !this._animation.animations.length) {
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

SimulationState.prototype.hasTokens = function(scopeElement, processInstanceId) {
  return scopeElement.children.reduce(function(hasTokens, element) {
    return (
      hasTokens ||
      element.tokenCount && element.tokenCount[processInstanceId]
    );
  }, false);
};

SimulationState.prototype.hasAnimations = function(scopeElement, processInstanceId) {
  return this._animation.animations.reduce(function(hasAnimations, animation) {
    return (
      hasAnimations ||
      isAncestor(scopeElement, animation.element) && animation.processInstanceId === processInstanceId
    );
  }, false);
};

/**
 * Check if process instance finished.
 * Element is necessary to display element notification if finished.
 */
SimulationState.prototype.isFinished = function(element, processInstanceId) {
  var processInstance = this._processInstances.getProcessInstance(processInstanceId);

  var scopeElement = processInstance.parent;

  if (!scopeElement) {
    scopeElement = this._canvas.getRootElement();
  }

  var hasTokens = this.hasTokens(scopeElement, processInstanceId);

  var hasAnimations = this.hasAnimations(scopeElement, processInstanceId);

  if (!hasTokens && !hasAnimations) {
    if (is(scopeElement, 'bpmn:SubProcess')) {
      this._log.log('Subprocess ' + processInstanceId + ' finished', 'info', 'fa-check-circle');
    } else {
      this._log.log('Process ' + processInstanceId + ' finished', 'success', 'fa-check-circle');

      this._elementNotifications.addElementNotification(element, {
        type: 'success',
        icon: 'fa-check-circle',
        text: 'Finished'
      });
    }

    return true;
  }
};

SimulationState.$inject = [
  'eventBus',
  'animation',
  'elementRegistry',
  'log',
  'elementNotifications',
  'canvas',
  'processInstances'
];

module.exports = SimulationState;
