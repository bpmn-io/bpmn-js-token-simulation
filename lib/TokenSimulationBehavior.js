'use strict';

var is = require('./util/ElementHelper').is;

var forEach = require('lodash/forEach');

function TokenSimulationBehavior(eventBus, tokenDisplay, animation, elementRegistry) {
  var self = this;

  this.runningAnimations = [];

  eventBus.on('tokenSimulation.reset', function() {
    self.runningAnimations.forEach(function(runningAnimation) {
      runningAnimation.cancel();
    });

    self.runningAnimations = [];
  });

  eventBus.on('tokenSimulation.createToken', function(event) {
    eventBus.fire('tokenSimulation.tokenProcessed', { connections : event.element.outgoing });
  });

  eventBus.on('tokenSimulation.tokenProcessed', function(event) {
    var connections = event.connections;

    forEach(connections, function(connection) {
      eventBus.fire('tokenSimulation.tokenStarted', { connection: connection, done: function() {
        eventBus.fire('tokenSimulation.tokenArrived', { element: connection.target });
      }});
    });
  });

  eventBus.on('tokenSimulation.tokenStarted', function(event) {
    var referenceToAnimation;

    var createdAnimation = animation.createAnimation(event.connection, function() {

      // remove animation once finished
      self.runningAnimations = self.runningAnimations.filter(function(runningAnimation) {
        return runningAnimation !== referenceToAnimation;
      });
      
      event.done();
    });

    referenceToAnimation = createdAnimation;

    createdAnimation.start();

    self.runningAnimations.push(createdAnimation);
  });

  eventBus.on('tokenSimulation.tokenArrived', function(event) {
    var element = event.element;

    // Tasks
    if (is(element, [ 'bpmn:Task'] )) {
      eventBus.fire('tokenSimulation.tokenProcessed', { element: element, connections : element.outgoing });

    // Exclusive Gateways
    } else if (is(element, [ 'bpmn:ExclusiveGateway' ])) {
      var sequenceFlow = element.configuredSequenceFlow;

      eventBus.fire('tokenSimulation.tokenProcessed', { element: element, connections : [sequenceFlow] });

    // Parallel Gateways
    } else if (is(element, [ 'bpmn:ParallelGateway' ])) {

      tokenDisplay.addToken(element);

      var incoming = element.incoming;

      if (incoming.length === element.tokens) {
        eventBus.fire('tokenSimulation.tokenProcessed', { element: element, connections : element.outgoing });
        tokenDisplay.removeAllTokens(element);
      }

    // Throw Events
    } else if (is(element, 'bpmn:ThrowEvent')) {
      eventBus.fire('tokenSimulation.tokenProcessed', { element: element, connections : element.outgoing });

    // Catch Events
    } else if (is(element, 'bpmn:CatchEvent')) {

      var done = function() {
        tokenDisplay.removeToken(element);
        eventBus.fire('tokenSimulation.tokenProcessed', { element: element, connections : element.outgoing });
      }

      tokenDisplay.addToken(element);

      eventBus.fire('tokenSimulation.activateCatchEventTrigger', { done: done, element: element });
    }
  });
}

TokenSimulationBehavior.$inject = [ 'eventBus', 'tokenDisplay', 'animation', 'elementRegistry' ];

module.exports = TokenSimulationBehavior;
