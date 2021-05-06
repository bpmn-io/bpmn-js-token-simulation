'use strict';

var domify = require('min-dom').domify,
    domEvent = require('min-dom').event;

var is = require('../../../util/ElementHelper').is;

function StartEventHandler(eventBus, elementRegistry, animation, simulator) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._animation = animation;
  this._simulator = simulator;
}

StartEventHandler.prototype.createContextPads = function(element) {
  var tokens = false;

  this._elementRegistry.forEach(function(element) {
    if (element.tokenCount) {
      Object.values(element.tokenCount).forEach(function(tokenCount) {
        if (tokenCount) {
          tokens = true;
        }
      });
    }
  });

  if (is(element.parent, 'bpmn:SubProcess') ||
      tokens ||
      this._animation.animations.length) {
    return;
  }

  var self = this;

  var contextPad = domify('<div class="context-pad"><i class="fa fa-play"></i></div>');

  domEvent.bind(contextPad, 'click', function() {
    self._simulator.signal({ element: element });
  });

  return [{
    element: element,
    html: contextPad
  }];
};

StartEventHandler.$inject = [ 'eventBus', 'elementRegistry', 'animation', 'simulator' ];

module.exports = StartEventHandler;