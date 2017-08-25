'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT;

function IntermeditateCatchEventHandler(eventBus) {
  this._eventBus = eventBus;
}

IntermeditateCatchEventHandler.prototype.createContextPad = function(element) {
  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (!element.tokenCount || !outgoingSequenceFlows.length) {
    return;
  }

  var self = this;

  var contextPad = domify('<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>');
  
  domEvent.bind(contextPad, 'click', function() {
    element.tokenCount--;

    self._eventBus.fire(GENERATE_TOKEN_EVENT, {
      element: element
    });
  });

  return contextPad;
};

IntermeditateCatchEventHandler.$inject = [ 'eventBus' ];

module.exports = IntermeditateCatchEventHandler;