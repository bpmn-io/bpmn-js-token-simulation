'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var is = require('./util/ElementHelper').is;

var OFFSET_TOP = -20,
    OFFSET_LEFT = -15;

function ContextMenus(overlays, eventBus, elementRegistry, simulationState) {
  var self = this;

  this._overlays = overlays;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._simulationState = simulationState;

  this.contextMenus = [];

  eventBus.on('tokenSimulation.start', function() {
    self.hideContextMenus({ type: 'bpmn:StartEvent' });
  });

  eventBus.on([ 'tokenSimulation.stop', 'tokenSimulation.reset' ], function() {
    self.showContextMenus({ type: 'bpmn:StartEvent' });
  });

  eventBus.on('tokenSimulation.switchMode', function(context) {
    var mode = context.mode;

    if (mode === 'simulation') {
      self.createContextMenus();
    } else {
      self.closeContextMenus();
    }
  });
}

ContextMenus.prototype.createContextMenus = function(filter) {
  var self = this;

  var elements;

  if (filter) {
    elements = this._elementRegistry.filter(function(element) {
      return element.type === filter.type;
    });
  } else {
    elements = this._elementRegistry.getAll();
  }

  elements.forEach(function(element) {
    self.createContextMenu(element);
  });
};

ContextMenus.prototype.createContextMenu = function(element) {
  var self = this;

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

  var overlayId = this._overlays.add(element, 'context-menu', {
    position: position,
    html: html
  });

  this.contextMenus.push({
    element: element,
    overlay: overlayId,
    html: html
  });
};

ContextMenus.prototype.closeContextMenus = function(filter) {
  var self = this;

  var contextMenus;
  
  if (filter) {
    contextMenus = this.contextMenus.filter(function(contextMenu) {
      return contextMenu.element.type === filter.type;
    });
  } else {
    contextMenus = this.contextMenus;
  }

  contextMenus.forEach(function(contextMenu) {
    self._overlays.remove(contextMenu.overlay);

    self.contextMenus = self.contextMenus.filter(function(c) {
      return c.overlay !== contextMenu.overlay;
    });
  });
};

ContextMenus.prototype.showContextMenus = function(filter) {
  var contextMenus;

  if (filter) {
    contextMenus = this.contextMenus.filter(function(contextMenu) {
      return contextMenu.element.type === filter.type;
    });
  } else {
    contextMenus = this.contextMenus;
  }

  contextMenus.forEach(function(contextMenu) {
    var html = contextMenu.html;
    
    domClasses(html).remove('hidden');
  });
};

ContextMenus.prototype.hideContextMenus = function(filter) {
  var contextMenus;
  
  if (filter) {
    contextMenus = this.contextMenus.filter(function(contextMenu) {
      return contextMenu.element.type === filter.type;
    });
  } else {
    contextMenus = this.contextMenus;
  }

  contextMenus.forEach(function(contextMenu) {
    var html = contextMenu.html;
    
    domClasses(html).add('hidden');
  });
};

ContextMenus.$inject = [ 'overlays', 'eventBus', 'elementRegistry', 'simulationState' ];

module.exports = ContextMenus;