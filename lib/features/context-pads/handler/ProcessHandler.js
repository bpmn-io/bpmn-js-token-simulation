import {
  domify,
  event as domEvent
} from 'min-dom';

// TODO(nikku): what does this do? Fix or remove

/**
 * Is used for subprocesses and participants.
 */
export default function ProcessHandler(processInstances, processInstanceSettings) {
  this._processInstances = processInstances;
  this._processInstanceSettings = processInstanceSettings;
}

ProcessHandler.prototype.createContextPads = function(element) {
  var self = this;

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
    element: element,
    html: contextPad
  }];
};

ProcessHandler.$inject = [ 'processInstances', 'processInstanceSettings' ];