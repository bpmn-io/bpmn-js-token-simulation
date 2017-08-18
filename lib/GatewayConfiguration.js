'use strict';

var NO_CONFIGURATION_COLOR = '#999';

function getNext(gateway) {
  var outgoing = gateway.outgoing;

  var index = outgoing.indexOf(gateway.configuredSequenceFlow);

  if (outgoing[index + 1]) {
    return outgoing[index + 1];
  } else {
    return outgoing[0];
  }
}

function setColor(element, colors, elementRegistry, graphicsFactory) {
  var businessObject = element.businessObject;

  if (colors.stroke) {
    businessObject.di.set('stroke', colors.stroke);
  }

  if (colors.fill) {
    businessObject.di.set('fill', colors.fill);
  }

  var gfx = elementRegistry.getGraphics(element);
 
  graphicsFactory.update('connection', element, gfx);
}

function GatewayConfiguration(eventBus, elementRegistry, graphicsFactory) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
  
  eventBus.on('tokenSimulation.configureGateway', function(context) {
    var gateway = context.element;

    var outgoing = gateway.outgoing;

    if (!outgoing.length) {
      return;
    }

    // check all outgoing sequence flows
    // check for configured sequence flow
    var configuredSequenceFlow = gateway.configuredSequenceFlow;

    if (configuredSequenceFlow) {
      
      // choose next sequence flow
      self.setConfiguredSequenceflow(gateway, getNext(gateway));
    } else {

      // choose first sequence flow
      self.setConfiguredSequenceflow(gateway, gateway.outgoing[0]);
    }
  });
}

GatewayConfiguration.prototype.setConfiguredSequenceflow = function(gateway, configuredSequenceFlow) {
  var self = this;

  gateway.configuredSequenceFlow = configuredSequenceFlow;

  // update colors
  gateway.outgoing.forEach(function(outgoing) {
    if (outgoing === configuredSequenceFlow) {
      setColor(outgoing, { stroke: '#000' }, self._elementRegistry, self._graphicsFactory);
    } else {
      setColor(outgoing, { stroke: NO_CONFIGURATION_COLOR }, self._elementRegistry, self._graphicsFactory);
    }
  });
};

GatewayConfiguration.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = GatewayConfiguration;