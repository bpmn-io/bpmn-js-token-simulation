'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    PROCESS_INSTANCE_CREATED_EVENT = events.PROCESS_INSTANCE_CREATED_EVENT,
    PROCESS_INSTANCE_FINISHED_EVENT = events.PROCESS_INSTANCE_FINISHED_EVENT;

function ProcessInstances(eventBus, processInstanceIds) {
  var self = this;

  this._eventBus = eventBus;
  this._processInstanceIds = processInstanceIds;

  this.processInstances = [];

  // clear instances
  eventBus.on([ TOGGLE_MODE_EVENT, RESET_SIMULATION_EVENT ], function() {
    self.processInstances = [];
  });
}

/**
 * Create a new process instance.
 *
 * @param {Object} parent - Parent element which contains all child elements of process definition.
 * @param {string} [parentProcessInstanceId] - Optional ID of parent process instance.
 */
ProcessInstances.prototype.create = function(parent, parentProcessInstanceId) {
  var processInstanceId = this._processInstanceIds.getNext();

  var processInstance = {
    parent: parent,
    processInstanceId: processInstanceId,
    parentProcessInstanceId: parentProcessInstanceId
  };

  this.processInstances.push(processInstance);

  this._eventBus.fire(PROCESS_INSTANCE_CREATED_EVENT, processInstance);

  return processInstanceId;
};

ProcessInstances.prototype.remove = function(processInstanceId) {
  this.processInstances = this.processInstances.filter(function(processInstance) {
    return processInstance.processInstanceId !== processInstanceId;
  });
};

/**
 * Finish a process instance.
 *
 * @param {string} processInstanceId - ID of process instance.
 */
ProcessInstances.prototype.finish = function(processInstanceId) {
  var processInstance = this.processInstances.find(function(processInstance) {
    return processInstance.processInstanceId === processInstanceId;
  });

  this._eventBus.fire(PROCESS_INSTANCE_FINISHED_EVENT, processInstance);

  processInstance.isFinished = true;
};

/**
 * @param {Object} [parent] - Optional parent.
 * @param {Object} [options] - Optional options.
 * @param {boolean} [options.includeFinished] - Wether to include finished process instance.
 */
ProcessInstances.prototype.getProcessInstances = function(parent, options) {
  if (!parent) {
    return this.processInstances;
  }

  var processInstances = this.processInstances.filter(function(processInstance) {
    return processInstance.parent === parent;
  });

  if (options && options.includeFinished !== true) {
    processInstances = processInstances.filter(function(processInstance) {
      return !processInstance.isFinished;
    });
  }

  return processInstances;
};

ProcessInstances.prototype.getProcessInstance = function(processInstanceId) {
  return this.processInstances.find(function(processInstance) {
    return processInstance.processInstanceId === processInstanceId;
  });
};

ProcessInstances.$inject = [ 'eventBus', 'processInstanceIds' ];

module.exports = tryCatchAll(ProcessInstances);