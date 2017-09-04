'use strict';

var elementHelper = require('../../util/ElementHelper'),
    is = elementHelper.is,
    isParent = elementHelper.isParent;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    TERMINATE_EVENT = events.TERMINATE_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT,
    UPDATE_ELEMENT_EVENT = events.UPDATE_ELEMENT_EVENT;

var ExclusiveGatewayHandler = require('./handler/ExclusiveGatewayHandler'),
    IntermediateCatchEventHandler = require('./handler/IntermediateCatchEventHandler'),
    StartEventHandler = require('./handler/StartEventHandler');

var LOW_PRIORITY = 500;

var OFFSET_TOP = -15,
    OFFSET_LEFT = -15;

function ContextPads(eventBus, elementRegistry, overlays, injector, canvas) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._injector = injector;
  this._canvas = canvas;

  this.overlayIds = {};

  this.handlers = {};

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', IntermediateCatchEventHandler);
  this.registerHandler('bpmn:StartEvent', StartEventHandler);

  eventBus.on(TOGGLE_MODE_EVENT, LOW_PRIORITY, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (simulationModeActive) {
      self.openContextPads();
    } else {
      self.closeContextPads();
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, function() {
    self.closeContextPads();
    self.openContextPads();
  });

  eventBus.on(TERMINATE_EVENT, LOW_PRIORITY, function(context) {
    var element = context.element,
        scope = element.parent;

    self.closeContextPads(scope);
  });

  eventBus.on(UPDATE_ELEMENTS_EVENT, LOW_PRIORITY, function(context) {
    var elements = context.elements;

    elements.forEach(function(element) {
      self.closeContextPad(element);
      self.openContextPad(element);
    });
  });

  eventBus.on(UPDATE_ELEMENT_EVENT, LOW_PRIORITY, function(context) {
    var element = context.element;

    self.closeContextPad(element);
    self.openContextPad(element);
  });
}

ContextPads.prototype.registerHandler = function(type, handlerCls) {
  var handler = this._injector.instantiate(handlerCls);

  this.handlers[type] = handler;
};

ContextPads.prototype.openContextPads = function(scope) {
  var self = this;
  
  if (!scope) {
    scope = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach(function(element) {
    if (self.handlers[element.type]
        && isParent(scope, element)) {
      self.openContextPad(element);
    }
  });
};

ContextPads.prototype.openContextPad = function(element) {
  if (!this.handlers[element.type]) {
    return;
  }

  var contextPad = this.handlers[element.type].createContextPad(element);
  
  if (!contextPad) {
    return;
  }

  var position = { top: OFFSET_TOP, left: OFFSET_LEFT };

  var overlayId = this._overlays.add(element, 'context-menu', {
    position: position,
    html: contextPad,
    show: {
      minZoom: 0.5
    }
  });

  this.overlayIds[element.id] = overlayId;
};

ContextPads.prototype.closeContextPads = function(scope) {
  var self = this;

  if (!scope) {
    scope = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach(function(element) {
    if (isParent(scope, element)) {
      self.closeContextPad(element);
    }
  });
};

ContextPads.prototype.closeContextPad = function(element) {
  var overlayId = this.overlayIds[element.id];

  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this.overlayIds[element.id];
};

ContextPads.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'injector', 'canvas' ];

module.exports = ContextPads;