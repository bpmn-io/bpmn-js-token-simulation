'use strict';

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT;

function ProcessInstanceIds(eventBus) {
  var self = this;

  this.nextProcessInstanceId = 1;

  eventBus.on(TOGGLE_MODE_EVENT, this.reset.bind(this));

  eventBus.on(RESET_SIMULATION_EVENT, this.reset.bind(this));
}

ProcessInstanceIds.prototype.getNext = function() {
  var processInstanceId  = this.nextProcessInstanceId;

  this.nextProcessInstanceId++;

  return processInstanceId;
};

ProcessInstanceIds.prototype.reset = function() {
  this.nextProcessInstanceId = 1;
};

ProcessInstanceIds.$inject = [ 'eventBus' ];

module.exports = ProcessInstanceIds;