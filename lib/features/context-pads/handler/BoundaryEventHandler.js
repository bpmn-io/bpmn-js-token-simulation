'use strict';

var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event');

var is = require('../../../util/ElementHelper').is;

var events = require('../../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    UPDATE_ELEMENT_EVENT = events.UPDATE_ELEMENT_EVENT;

function BoundaryEventHandler(eventBus, processInstances, processInstanceSettings) {
  this._eventBus = eventBus;
  this._processInstances = processInstances;
  this._processInstanceSettings = processInstanceSettings;
}

BoundaryEventHandler.prototype.createContextPads = function(element) {
  if (!element.attachers.length) {
    return;
  }

  if (!this._processInstances.getProcessInstances(element).length) {
    return;
  }

  var incomingSequenceFlows = element.incoming.filter(function(incoming) {
    return is(incoming, 'bpmn:SequenceFlow');
  });

  var self = this;

  var contextPads = [];

  element.attachers.forEach(function(attachedElement) {
    var outgoingSequenceFlows = attachedElement.outgoing.filter(function(outgoing) {
      return is(outgoing, 'bpmn:SequenceFlow');
    });

    if (!incomingSequenceFlows.length || !outgoingSequenceFlows.length) {
      return;
    }

    var contextPad = domify('<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>');

    contextPads.push({
      element: attachedElement,
      html: contextPad
    });

    domEvent.bind(contextPad, 'click', function() {

      self._processInstances
        .getProcessInstances(element)
        .forEach(function(processInstance) {
          var parentProcessInstanceId = processInstance.parentProcessInstanceId;

          // interrupting
          if (attachedElement.businessObject.cancelActivity) {
            element.children.forEach(function(child) {
              if (child.tokenCount && child.tokenCount[processInstance.processInstanceId]) {
                child.tokenCount[processInstance.processInstanceId]--;
              }
            });

            // finish but do NOT remove
            self._processInstances.finish(processInstance.processInstanceId);

            self._eventBus.fire(UPDATE_ELEMENT_EVENT, {
              element: element
            });
          }

          self._eventBus.fire(GENERATE_TOKEN_EVENT, {
            element: attachedElement,
            processInstanceId: parentProcessInstanceId
          });
        });

    });
  });

  return contextPads;
};

BoundaryEventHandler.$inject = ['eventBus', 'processInstances', 'processInstanceSettings'];

module.exports = BoundaryEventHandler;