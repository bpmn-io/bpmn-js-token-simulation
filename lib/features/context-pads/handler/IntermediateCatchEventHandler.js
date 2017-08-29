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
  var incomingSequenceFlows = element.incoming.filter(function(incoming) {
    return is(incoming, 'bpmn:SequenceFlow');
  });

  var eventBasedGatewaysHaveTokens = [];
  
  incomingSequenceFlows.forEach(function(incoming) {
    var source = incoming.source;
    
    if (is(source, 'bpmn:EventBasedGateway') && source.tokenCount) {
      eventBasedGatewaysHaveTokens.push(source);
    }
  });

  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (!incomingSequenceFlows.length || !outgoingSequenceFlows.length) {
    return;
  }

  var self = this;

  var contextPad;

  if (element.tokenCount) {
    contextPad = domify('<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>');
    
    domEvent.bind(contextPad, 'click', function() {
      element.tokenCount--;
  
      self._eventBus.fire(GENERATE_TOKEN_EVENT, {
        element: element
      });
    });
  } else if (eventBasedGatewaysHaveTokens.length) {
    contextPad = domify('<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>');
    
    domEvent.bind(contextPad, 'click', function() {
      eventBasedGatewaysHaveTokens.forEach(function(eventBasedGateway) {
        eventBasedGateway.tokenCount--;
      });
  
      self._eventBus.fire(GENERATE_TOKEN_EVENT, {
        element: element
      });
    });
  }

  return contextPad;
};

IntermeditateCatchEventHandler.$inject = [ 'eventBus' ];

module.exports = IntermeditateCatchEventHandler;