'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var events = require('../../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function StartEventHandler(eventBus) {
  this._eventBus = eventBus;
}

StartEventHandler.prototype.createContextPad = function(element) {
  var self = this;

  var contextPad = domify('<div class="context-pad"><i class="fa fa-play"></i></div>');
  
  domEvent.bind(contextPad, 'click', function() {
    self._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
  });

  return contextPad;
};

StartEventHandler.$inject = [ 'eventBus' ];

module.exports = StartEventHandler;