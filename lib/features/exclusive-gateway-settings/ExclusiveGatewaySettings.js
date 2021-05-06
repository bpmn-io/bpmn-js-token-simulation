'use strict';

var is = require('../../util/ElementHelper').is;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var NOT_SELECTED_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--token-simulation-grey-lighten-56'),
    SELECTED_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--token-simulation-grey-darken-30');

function getNext(gateway, sequenceFlow) {
  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  var index = outgoing.indexOf(sequenceFlow || gateway.sequenceFlow);

  if (outgoing[index + 1]) {
    return outgoing[index + 1];
  } else {
    return outgoing[0];
  }
}

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}


function ExclusiveGatewaySettings(eventBus, elementRegistry, graphicsFactory, simulator) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
  this._simulator = simulator;

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
  const exclusiveGateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  for (const gateway of exclusiveGateways) {

    const outgoings = gateway.outgoing.filter(isSequenceFlow);

    this._simulator.setConfig(gateway, {
      activeOutgoing: outgoings[0]
    });
  }
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
  this._simulator.setConfig(gateway, { activeOutgoing: undefined });
};

ExclusiveGatewaySettings.prototype.setSequenceFlow = function(gateway) {
  var self = this;

  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  if (!outgoing.length) {
    return;
  }

  var { activeOutgoing } = this._simulator.getConfig(gateway);

  var newActiveOutgoing;

  if (activeOutgoing) {

    // set next sequence flow
    newActiveOutgoing = getNext(gateway, activeOutgoing);
  } else {

    // set first sequence flow
    newActiveOutgoing = outgoing[ 0 ];
  }

  console.log('new active outgoing', newActiveOutgoing.id);

  this._simulator.setConfig(gateway, { activeOutgoing: newActiveOutgoing });

  // set colors
  gateway.outgoing.forEach(function(outgoing) {
    if (outgoing === newActiveOutgoing) {
      self.setColor(outgoing, SELECTED_COLOR);
    } else {
      self.setColor(outgoing, NOT_SELECTED_COLOR);
    }
  });
};

ExclusiveGatewaySettings.prototype.setColor = function(sequenceFlow, color) {

  var label = sequenceFlow.label;
  var businessObject = sequenceFlow.businessObject;

  businessObject.di.set('stroke', color);

  var gfx = this._elementRegistry.getGraphics(sequenceFlow);

  this._graphicsFactory.update('connection', sequenceFlow, gfx);

  if (label) {
    this._graphicsFactory.update('connection', label, this._elementRegistry.getGraphics(label));
  }
};

ExclusiveGatewaySettings.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory', 'simulator' ];

module.exports = ExclusiveGatewaySettings;