'use strict';

var domify = require('min-dom/lib/domify');

var is = require('../../util/ElementHelper').is;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT;

var OFFSET_BOTTOM = 10,
    OFFSET_LEFT = -15;

var LOW_PRIORITY = 500;

function TokenCount(eventBus, overlays) {  
  var self = this;

  this._overlays = overlays;

  this.overlayIds = {};

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.removeTokenCounts();
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, function() {
    self.removeTokenCounts();
  });

  eventBus.on([ GENERATE_TOKEN_EVENT, CONSUME_TOKEN_EVENT ], LOW_PRIORITY, function(context) {
    var element = context.element;

    self.removeTokenCount(element);
    self.addTokenCount(element);
  });
}

TokenCount.prototype.addTokenCount = function(element) {
  if (!element.tokenCount) {
    return;
  }

  var tokenCount = this.createTokenCount(element);

  var position = { bottom: OFFSET_BOTTOM, left: OFFSET_LEFT };
  
  var overlayId = this._overlays.add(element, 'token-count', {
    position: position,
    html: tokenCount,
    show: {
      minZoom: 0.5
    }
  });

  this.overlayIds[element.id] = overlayId;
};

TokenCount.prototype.createTokenCount = function(element) {
  return domify('<div class="token-count waiting">' + element.tokenCount + '</div>');
};

TokenCount.prototype.removeTokenCounts = function() {
  this._overlays.remove({ type: 'token-count' });
};

TokenCount.prototype.removeTokenCount = function(element) {
  var overlayId = this.overlayIds[element.id];
  
  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this.overlayIds[element.id];
};

TokenCount.$inject = [ 'eventBus', 'overlays' ];

module.exports = TokenCount;