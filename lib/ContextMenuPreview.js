'use strict';

var domify = require('min-dom/lib/domify');

var is = require('./util/ElementHelper').is;

var OFFSET_TOP = -20,
    OFFSET_LEFT = -15;

function ContextMenuPreview(eventBus, elementRegistry, overlays) {
  var self = this;

  this._overlays = overlays;

  eventBus.on('tokenSimulation.switchMode', 10000, function(context) {
    var mode = context.mode;

    if (mode === 'simulation') {
      elementRegistry.forEach(function(element) {
      
        if (is(element, [ 'bpmn:StartEvent', 'bpmn:ExclusiveGateway' ])) {
          self.appendPreview(element);
        }

      });
    } else {
      self.removeAll();
    }
  });
}

ContextMenuPreview.prototype.appendPreview = function(element) {
  var html;

  if (is(element, 'bpmn:StartEvent')) {
    html = domify('<div class="context-menu preview"><i class="fa fa-play"></i></div>');
  }

  if (is(element, 'bpmn:ExclusiveGateway') && element.outgoing.length > 1) {
    html = domify('<div class="context-menu preview"><i class="fa fa-code-fork"></i></div>');
  }

  if (!html) {
    return;
  }

  var position = { top: OFFSET_TOP, left: OFFSET_LEFT };
  
  this._overlays.add(element, 'token-simulation-context-menu-preview', {
    position: position,
    html: html
  });
}

ContextMenuPreview.prototype.removeAll = function() {
  this._overlays.remove({ type: 'token-simulation-context-menu-preview' });
};

ContextMenuPreview.$inject = [ 'eventBus', 'elementRegistry', 'overlays' ];

module.exports = ContextMenuPreview;