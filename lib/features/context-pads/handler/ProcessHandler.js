'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

/**
 * Is used for subprocesses and participants.
 */
function ProcessHandler(processInstances, processInstanceSettings) {
  this._processInstances = processInstances;
  this._processInstanceSettings = processInstanceSettings;
}

ProcessHandler.prototype.createContextPads = function(element) {
  var self = this;

  // check if multiple instances
  var processInstances = this._processInstances
    .getProcessInstances(element)
    .filter(function(processInstance) {
      return !processInstance.isFinished;
    });

  if (processInstances.length < 2) {
    return;
  }

  var contextPad = domify('<div class="context-pad" title="View Process Instances"><i class="fa fa-list-ol"></i></div>');
  
  domEvent.bind(contextPad, 'click', function() {
    self._processInstanceSettings.showNext(element);
  });

  return [{
    forElement: element,
    html: contextPad
  }];
};

ProcessHandler.$inject = [ 'processInstances', 'processInstanceSettings' ];

module.exports = ProcessHandler;