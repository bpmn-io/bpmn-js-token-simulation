'use strict';

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    PROCESS_INSTANCE_CREATED_EVENT = events.PROCESS_INSTANCE_CREATED_EVENT,
    PROCESS_INSTANCE_FINISHED_EVENT = events.PROCESS_INSTANCE_FINISHED_EVENT,
    PROCESS_INSTANCE_SHOWN_EVENT = events.PROCESS_INSTANCE_SHOWN_EVENT,
    PROCESS_INSTANCE_HIDDEN_EVENT = events.PROCESS_INSTANCE_HIDDEN_EVENT;

var LOW_PRIORITY = 500;

function ProcessInstanceSettings(animation, eventBus, processInstances, elementRegistry) {
  var self = this;
  
  this._animation = animation;
  this._eventBus = eventBus;
  this._processInstances = processInstances;
  this._elementRegistry = elementRegistry;

  this._eventBus.on(PROCESS_INSTANCE_CREATED_EVENT, LOW_PRIORITY, function(context) {
    var parent = context.parent,
        processInstanceId = context.processInstanceId;

    var processInstancesWithParent = processInstances.getProcessInstances(parent).filter(function(processInstance) {
      return !processInstance.isFinished;
    });

    if (processInstancesWithParent.length === 1) {
      self.showProcessInstance(processInstanceId, parent);
    } else if (processInstancesWithParent.length > 1) {
      self.hideProcessInstance(processInstanceId);
    }
  });

  this._eventBus.on(PROCESS_INSTANCE_FINISHED_EVENT, LOW_PRIORITY, function(context) {
    var parent = context.parent,
        processInstanceId = context.processInstanceId;

    var processInstancesWithParent = processInstances
      .getProcessInstances(parent)
      .filter(function(processInstance) {
        return processInstanceId !== processInstance.processInstanceId && !processInstance.isFinished;
      });

    // show remaining process instance
    if (processInstancesWithParent.length
        && processInstanceId === parent.shownProcessInstance) {

      self.showProcessInstance(processInstancesWithParent[0].processInstanceId, parent);

    } else {
      delete parent.shownProcessInstance;
    }

    // outer process is finished
    if (!parent.parent) {
      elementRegistry.forEach(function(element) {
        delete element.shownProcessInstance;
      });
    }
  });

  eventBus.on(TOGGLE_MODE_EVENT, function() {
    elementRegistry.forEach(function(element) {
      delete element.shownProcessInstance;
    });
  });
}

ProcessInstanceSettings.prototype.showProcessInstance = function(processInstanceId, parent) {
  this._animation.showProcessInstanceAnimations(processInstanceId);

  parent.shownProcessInstance = processInstanceId;

  this._eventBus.fire(PROCESS_INSTANCE_SHOWN_EVENT, {
    processInstanceId: processInstanceId
  });
};

ProcessInstanceSettings.prototype.hideProcessInstance = function(processInstanceId) {
  this._animation.hideProcessInstanceAnimations(processInstanceId);

  this._eventBus.fire(PROCESS_INSTANCE_HIDDEN_EVENT, {
    processInstanceId: processInstanceId
  });
};

ProcessInstanceSettings.prototype.showNext = function(parent) {
  var self = this;

  var processInstancesWithParent = this._processInstances.getProcessInstances(parent);

  var shownProcessInstance = parent.shownProcessInstance;

  var indexOfShownProcessInstance = 0;

  for (let i = 0; i < processInstancesWithParent.length; i++) {
    if (processInstancesWithParent[i].processInstanceId === shownProcessInstance) {
      break;
    } else {
      indexOfShownProcessInstance++;
    }
  }

  processInstancesWithParent.forEach(function(processInstance) {
    self.hideProcessInstance(processInstance.processInstanceId);
  });

  if (indexOfShownProcessInstance === processInstancesWithParent.length - 1) {

    // last index
    this.showProcessInstance(processInstancesWithParent[0].processInstanceId, parent);
  } else {

    // not last index
    this.showProcessInstance(processInstancesWithParent[indexOfShownProcessInstance + 1].processInstanceId, parent);
  }
};

ProcessInstanceSettings.$inject = [ 'animation', 'eventBus', 'processInstances', 'elementRegistry' ];

module.exports = ProcessInstanceSettings;