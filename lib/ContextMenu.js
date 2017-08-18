'use strict';

var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event');

var is = require('./util/ElementHelper').is;

var OFFSET_TOP = -20,
    OFFSET_LEFT = -15;

function ContextMenu(overlays, eventBus, simulationState) {
  var self = this;

  this._overlays = overlays;
  this._eventBus = eventBus;
  this._simulationState = simulationState;

  this.selectedElement = undefined;

  this.isActive = false;

  eventBus.on('tokenSimulation.start', function() {
    self.close();
  });

  eventBus.on([ 'tokenSimulation.stop', 'tokenSimulation.reset' ], function() {
    if (self.selectedElement && is(self.selectedElement, 'bpmn:StartEvent')) {
      self.open(self.selectedElement);
    }
  });

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'simulation') {
      self.isActive = true;

      if (self.selectedElement && is(self.selectedElement, 'bpmn:StartEvent')) {
        self.open(self.selectedElement);
      }
    } else {
      self.close();

      self.isActive = false;
    }
  });
}

ContextMenu.prototype.open = function(element) {  
  var self = this;

  this.selectedElement = element;

  if (!this.isActive) {
    return;
  }

  var html;

  // Start Event
  if (is(element, 'bpmn:StartEvent')) {
    if (!this._simulationState.isActive()) {
      html = domify('<div class="context-menu"><i class="fa fa-play"></i></div>');

      domEvent.bind(html, 'click', function() {
        self._eventBus.fire('tokenSimulation.createToken', {
          element: element
        });
      });
    }
  }

  // Exclusive Gateway
  if (is(element, 'bpmn:ExclusiveGateway') && element.outgoing.length > 1) {
    html = domify('<div class="context-menu"><i class="fa fa-code-fork"></i></div>');

    domEvent.bind(html, 'click', function() {
      self._eventBus.fire('tokenSimulation.configureGateway', {
        element: element
      });
    });
  }

  if (!html) {
    return;
  }

  var position = { top: OFFSET_TOP, left: OFFSET_LEFT };

  this.overlay = this._overlays.add(element, 'token-simulation', {
    position: position,
    html: html
  });
};

ContextMenu.prototype.close = function() {
  if (this.overlay) {
    this._overlays.remove(this.overlay);

    this.overlay = undefined;
  }
};

ContextMenu.$inject = [ 'overlays', 'eventBus', 'simulationState' ];

module.exports = ContextMenu;