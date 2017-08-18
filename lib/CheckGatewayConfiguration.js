'use strict';

var is = require('./util/ElementHelper').is;

var WARNING_COLOR = '#cc0000',
    WARNING_TIME_TO_LIVE = 2000; // ms

var NO_CONFIGURATION_COLOR = '#999';

var DEFAULT_CONFIG = true;

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

/** 
 * Checks if all EXCLUSIVE gateways have been configured.
 * Shows warning if not.
 * 
 */
function CheckGatewayConfiguration(eventBus, elementRegistry, graphicsFactory) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'simulation') {
      self._init();
    } else {
      self.reset();
    }
  });

  eventBus.on('tokenSimulation.createToken', 10000, function() {
    if (!self.allGatewaysConfigured()) {
      eventBus.fire('tokenSimulation.showNotification', {
        text: 'Not all exclusive gateways are configured',
        notificationType: 'warning'
      });

      self.showWarning();
      
      return true;
    }
  });
}

CheckGatewayConfiguration.prototype._init = function() {
  var self = this;

  var gateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  gateways.forEach(function(element) {
    if (DEFAULT_CONFIG) {
      element.configuredSequenceFlow = element.outgoing[0];

      element.outgoing.forEach(function(outgoing) {
        if (outgoing !== element.configuredSequenceFlow) {
          setColor(outgoing, { stroke: NO_CONFIGURATION_COLOR }, self._elementRegistry, self._graphicsFactory);
        }
      });
    } else {
      if (element.outgoing.length === 1) {
        element.configuredSequenceFlow = element.outgoing[0];
      } else if (element.outgoing.length > 1) {
        element.outgoing.forEach(function(outgoing) {
          setColor(outgoing, { stroke: NO_CONFIGURATION_COLOR }, self._elementRegistry, self._graphicsFactory);
        });
      }
    }
  });
};

CheckGatewayConfiguration.prototype.allGatewaysConfigured = function() {
  var gateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  var areConfigured = true;

  gateways.forEach(function(element) {
    if (!element.configuredSequenceFlow) {
      areConfigured = false;
    }
  });

  return areConfigured;
};

CheckGatewayConfiguration.prototype.showWarning = function() {
  var self = this;

  var gateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  var gatewaysWithoutConfiguration = [];

  gateways.forEach(function(element) {
    if (!element.configuredSequenceFlow) {
      gatewaysWithoutConfiguration.push(element);
    }
  });

  gatewaysWithoutConfiguration.forEach(function(element) {
    setColor(element, { stroke: WARNING_COLOR }, self._elementRegistry, self._graphicsFactory);

    setTimeout(function() {
      setColor(element, { stroke: '#000' }, self._elementRegistry, self._graphicsFactory);
    }, WARNING_TIME_TO_LIVE);
  });
};

CheckGatewayConfiguration.prototype.reset = function() {
  var self = this;

  var gateways = this._elementRegistry.filter(function(element) {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  gateways.forEach(function(element) {
    if (element.configuredSequenceFlow) {
      delete element.configuredSequenceFlow;
    }

    element.outgoing.forEach(function(outgoing) {
      if (outgoing !== element.configuredSequenceFlow) {
        setColor(outgoing, { stroke: '#000' }, self._elementRegistry, self._graphicsFactory);
      }
    });
  });
};

CheckGatewayConfiguration.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = CheckGatewayConfiguration;