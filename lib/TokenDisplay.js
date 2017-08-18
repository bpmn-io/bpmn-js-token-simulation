'use strict';

var forEach = require('lodash/forEach');

var is = require('./util/ElementHelper').is;

function TokenDisplay(overlays, elementRegistry, eventBus) {
  this._overlays = overlays;
  this._elementRegistry = elementRegistry

  var self = this;

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'simulation') {
      self.init();
    } else {
      self.destroy();
    }
  });
}

TokenDisplay.prototype.init = function() {

  var overlays = this._overlays;

  var elements = this._elementRegistry.filter(function(element) {
    return is(element, [ 'bpmn:ParallelGateway', 'bpmn:IntermediateCatchEvent' ]);
  });

  var position = {
    bottom: 10,
    left: -15
  };

  var html = '<div class="token-display">0</div>';

  forEach(elements, function(element) {

    if (is(element, 'bpmn:ParallelGateway') && element.incoming && element.incoming.length === 1) {
      return;
    }

    overlays.add(element, 'token-display', {
      position: position,
      html: html
    });
  });
};


TokenDisplay.prototype.destroy = function() {
  this._overlays.remove({ type: 'token-display' });
};


TokenDisplay.prototype.addToken = function(element) {
  if (element.tokens === undefined) {
    element.tokens = 0;
  }

  element.tokens += 1;
  this._update(element);
};


TokenDisplay.prototype.removeAllTokens = function(element) {
  if (element.tokens && element.tokens > 0) {
    element.tokens = 0;
    this._update(element);
  }
};


TokenDisplay.prototype.removeToken = function(element) {
  element.tokens -= 1;
  this._update(element);
};


TokenDisplay.prototype._update = function(element) {
  var overlay = this._overlays.get({ element: element, type: 'token-display'})[0];

  if (!overlay) {
    return;
  }

  var overlayDiv = overlay.htmlContainer.querySelector('div')

  overlayDiv.textContent = element.tokens;

  if (element.tokens > 0) {
    overlayDiv.classList.add('waiting');
  } else {
    overlayDiv.classList.remove('waiting');
  }
};

TokenDisplay.$inject = [ 'overlays', 'elementRegistry', 'eventBus' ];

module.exports = TokenDisplay;
