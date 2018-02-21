'use strict';

var elementHelper = require('../../util/ElementHelper'),
    is = elementHelper.is,
    isAncestor = elementHelper.isAncestor;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    TERMINATE_EVENT = events.TERMINATE_EVENT,
    UPDATE_ELEMENTS_EVENT = events.UPDATE_ELEMENTS_EVENT,
    UPDATE_ELEMENT_EVENT = events.UPDATE_ELEMENT_EVENT,
    PROCESS_INSTANCE_SHOWN_EVENT = events.PROCESS_INSTANCE_SHOWN_EVENT;

var BoundaryEventHandler = require('./handler/BoundaryEventHandler'),
    ExclusiveGatewayHandler = require('./handler/ExclusiveGatewayHandler'),
    IntermediateCatchEventHandler = require('./handler/IntermediateCatchEventHandler'),
    ProcessHandler = require('./handler/ProcessHandler'),
    StartEventHandler = require('./handler/StartEventHandler');

var LOW_PRIORITY = 500;

var OFFSET_TOP = -15,
    OFFSET_LEFT = -15;

function ContextPads(eventBus, elementRegistry, overlays, injector, canvas, processInstances) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._injector = injector;
  this._canvas = canvas;
  this._processInstances = processInstances;

  this.overlayIds = {};

  this.handlers = {};

  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', IntermediateCatchEventHandler);
  this.registerHandler('bpmn:SubProcess', ProcessHandler);
  this.registerHandler('bpmn:SubProcess', BoundaryEventHandler);
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
        parent = element.parent;

    self.closeContextPads(parent);
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

  eventBus.on(PROCESS_INSTANCE_SHOWN_EVENT, function(context) {
    var processInstanceId = context.processInstanceId;

    var processInstance = processInstances.getProcessInstance(processInstanceId),
        parent = processInstance.parent;

    self.closeContextPads(parent);
    self.openContextPads(parent);
  });
}

ContextPads.prototype.registerHandler = function(type, handlerCls) {
  var handler = this._injector.instantiate(handlerCls);

  if(this.handlers[type] == null) {
      this.handlers[type] = [];
  }

  this.handlers[type].push(handler);
};

ContextPads.prototype.openContextPads = function(parent) {
  var self = this;

  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach(function(element) {
    if (self.handlers[element.type]
        && isAncestor(parent, element)) {
      self.openContextPad(element);
    }
  });
};

ContextPads.prototype.openContextPad = function(element) {
  if (!this.handlers[element.type]) {
    return;
  }

  var contextPads = [];
  this.handlers[element.type].forEach(function (handler) {
    var pads = handler.createContextPads(element);
    if(pads) {
      pads.forEach(function (pad) {
        if(pad) {
          contextPads.push(pad);
        }
      });
    }
  });

  var self = this;

  contextPads.forEach(function (contextPad) {
    var position = { top: OFFSET_TOP, left: OFFSET_LEFT };

    var overlayId = self._overlays.add(contextPad.forElement, 'context-menu', {
        position: position,
        html: contextPad.html,
        show: {
          minZoom: 0.5
        }
    });

    self.overlayIds[contextPad.forElement.id] = overlayId;
  });
};

ContextPads.prototype.closeContextPads = function(parent) {
  var self = this;

  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach(function(element) {
    if (isAncestor(parent, element)) {
      self.closeContextPad(element);
    }
  });
};

ContextPads.prototype.closeContextPad = function(element) {
  var self = this;

  if (element.attachers && element.attachers.length > 0) {
    element.attachers.forEach(function (attachedElement) {
      self.closeContextPad(attachedElement);
    })
  }
  if (element.children && element.children.length > 0) {
    element.children.forEach(function (child) {
      self.closeContextPad(child);
    })
  }

  var overlayId = this.overlayIds[element.id];

  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this.overlayIds[element.id];
};

ContextPads.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'injector', 'canvas', 'processInstances' ];

module.exports = ContextPads;