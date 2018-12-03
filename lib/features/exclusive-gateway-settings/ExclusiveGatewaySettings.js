'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var is = require('../../util/ElementHelper').is;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var NO_CONFIGURATION_COLOR = '#999';

function getNext(gateway) {
  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  var index = outgoing.indexOf(gateway.sequenceFlow);

  if (outgoing[index + 1]) {
    return outgoing[index + 1];
  } else {
    return outgoing[0];
  }
}

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}


function ExclusiveGatewaySettings(eventBus, elementRegistry, graphicsFactory) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.resetSequenceFlows();
    } else {
      self.setSequenceFlowsDefault();
    }
  });
}

ExclusiveGatewaySettings.prototype.setSequenceFlowsDefault = function() {
  var self = this;

  var exclusiveGateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  exclusiveGateways.forEach(function(exclusiveGateway) {
    if (exclusiveGateway.outgoing.filter(isSequenceFlow).length) {
      self.setSequenceFlow(
        exclusiveGateway,
        exclusiveGateway.outgoing.filter(isSequenceFlow)[0]
      );
    }
  });
};

ExclusiveGatewaySettings.prototype.resetSequenceFlows = function() {
  var self = this;

  var exclusiveGateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  exclusiveGateways.forEach(function(exclusiveGateway) {
    if (exclusiveGateway.outgoing.filter(isSequenceFlow).length) {
      self.resetSequenceFlow(exclusiveGateway);
    }
  });
};

ExclusiveGatewaySettings.prototype.resetSequenceFlow = function(gateway) {
  if (gateway.sequenceFlow) {
    delete gateway.sequenceFlow;
  }
};

ExclusiveGatewaySettings.prototype.setSequenceFlow = function(gateway) {
  var self = this;

  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  if (!outgoing.length) {
    return;
  }

  var sequenceFlow = gateway.sequenceFlow;

  if (sequenceFlow) {

    // set next sequence flow
    gateway.sequenceFlow = getNext(gateway);
  } else {

    // set first sequence flow
    gateway.sequenceFlow = outgoing[0];
  }

  // set colors
  gateway.outgoing.forEach(function(outgoing) {
    if (outgoing === gateway.sequenceFlow) {
      self.setColor(outgoing, '#000');
    } else {
      self.setColor(outgoing, NO_CONFIGURATION_COLOR);
    }
  });
};

ExclusiveGatewaySettings.prototype.setColor = function(sequenceFlow, color) {
  var businessObject = sequenceFlow.businessObject;

  businessObject.di.set('stroke', color);

  var gfx = this._elementRegistry.getGraphics(sequenceFlow);

  this._graphicsFactory.update('connection', sequenceFlow, gfx);
};

ExclusiveGatewaySettings.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = tryCatchAll(ExclusiveGatewaySettings);