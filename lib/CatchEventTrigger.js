'use strict';

var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event');

function CatchEventTrigger(eventBus, overlays) {
  var self = this;
  
  this._overlays = overlays;

  this.contextMenus = [];

  eventBus.on('tokenSimulation.activateCatchEventTrigger', function(event) {
    var done = event.done;
    var element = event.element;

    var overlay = overlays.get({ type: 'token-simulation.event-trigger' })[0];

    if (overlay) {
      return;
    }

    var html = domify('<div class="context-menu"><i class="fa fa-play"></i></div>');

    var contextMenu = overlays.add(element, 'token-simulation', {
      position: { top: -20, left: -15 },
      html: html
    });

    self.contextMenus.push(contextMenu);

    domEvent.bind(html, 'click', function() {
      if (element.tokens === 1) {
        overlays.remove(contextMenu);
      }
      done();
    });
  });

  eventBus.on('tokenSimulation.switchMode', 10000, function(context) {
    var mode = context.mode;

    if (mode === 'modeling') {
      self.closeAllContextMenus();
    }
  });
}

CatchEventTrigger.prototype.closeAllContextMenus = function() {
  var self = this;

  this.contextMenus.forEach(function(contextMenu) {
    self._overlays.remove(contextMenu);
  });

  this.contextMenus = [];
};

CatchEventTrigger.$inject = [ 'eventBus', 'overlays' ];

module.exports = CatchEventTrigger;
