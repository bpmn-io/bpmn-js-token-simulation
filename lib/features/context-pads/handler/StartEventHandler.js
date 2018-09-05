'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function StartEventHandler(eventBus, elementRegistry, animation) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._animation = animation;
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
    self._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
  });

  return [{
    element: element,
    html: contextPad
  }];
};

StartEventHandler.$inject = [ 'eventBus', 'elementRegistry', 'animation' ];

module.exports = StartEventHandler;