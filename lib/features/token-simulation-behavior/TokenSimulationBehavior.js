'use strict';

var EndEventHandler = require('./handler/EndEventHandler'),
    EventBasedGatewayHandler = require('./handler/EventBasedGatewayHandler'),
    ExclusiveGatewayHandler = require('./handler/ExclusiveGatewayHandler'),
    IntermediateCatchEventHandler = require('./handler/IntermediateCatchEventHandler'),
    IntermediateThrowEventHandler = require('./handler/IntermediateThrowEventHandler'),
    ParallelGatewayHandler = require('./handler/ParallelGatewayHandler'),
    StartEventHandler = require('./handler/StartEventHandler'),
    SubProcessHandler = require('./handler/SubProcessHandler'),
    TaskHandler = require('./handler/TaskHandler');

var events = require('../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT;

function TokenSimulationBehavior(eventBus, animation, injector) {
  var self = this;

  this._injector = injector;

  this.handlers = {};

  this.registerHandler('bpmn:EndEvent', EndEventHandler);
  this.registerHandler('bpmn:EventBasedGateway', EventBasedGatewayHandler);
  this.registerHandler('bpmn:ExclusiveGateway', ExclusiveGatewayHandler);
  this.registerHandler('bpmn:IntermediateCatchEvent', IntermediateCatchEventHandler);
  this.registerHandler('bpmn:IntermediateThrowEvent', IntermediateThrowEventHandler);
  this.registerHandler('bpmn:ParallelGateway', ParallelGatewayHandler);
  this.registerHandler('bpmn:StartEvent', StartEventHandler);
  this.registerHandler('bpmn:SubProcess', SubProcessHandler);
  this.registerHandler([
    'bpmn:BusinessRuleTask',
    'bpmn:Task',
    'bpmn:ManualTask',
    'bpmn:UserTask'
  ], TaskHandler);

  // create animations on generate token
  eventBus.on(GENERATE_TOKEN_EVENT, function(context) {
    var element = context.element;
    
    if (!self.handlers[element.type]) {
      throw new Error('no handler for type ' + element.type);
    }

    self.handlers[element.type].generate(element);
  });

  // call handler on consume token
  eventBus.on(CONSUME_TOKEN_EVENT, function(context) {
    var element = context.element;

    if (!self.handlers[element.type]) {
      throw new Error('no handler for type ' + element.type);
    }

    self.handlers[element.type].consume(element);
  });
}

TokenSimulationBehavior.prototype.registerHandler = function(types, handlerCls) {
  var self = this;

  var handler = this._injector.instantiate(handlerCls);
  
  if (!Array.isArray(types)) {
    types = [ types ];
  }

  types.forEach(function(type) {
    self.handlers[type] = handler;
  });
};

TokenSimulationBehavior.$inject = [ 'eventBus', 'animation', 'injector' ];

module.exports = TokenSimulationBehavior;