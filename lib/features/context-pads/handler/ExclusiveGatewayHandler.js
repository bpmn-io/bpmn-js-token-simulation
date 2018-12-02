'use strict';

var is = require('../../../util/ElementHelper').is;

var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event');

function ExclusiveGatewayHandler(exluciveGatewaySettings) {
  this._exclusiveGatewaySettings = exluciveGatewaySettings;
}

ExclusiveGatewayHandler.prototype.createContextPads = function(element) {
  var self = this;

  var outgoingSequenceFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (outgoingSequenceFlows.length < 2) {
    return;
  }

  var contextPad = domify('<div class="context-pad" title="Set Sequence Flow"><i class="fa fa-code-fork"></i></div>');

  domEvent.bind(contextPad, 'click', function() {
    self._exclusiveGatewaySettings.setSequenceFlow(element);
  });

  return [{
    element: element,
    html: contextPad
  }];
};

ExclusiveGatewayHandler.$inject = [ 'exclusiveGatewaySettings' ];

module.exports = ExclusiveGatewayHandler;