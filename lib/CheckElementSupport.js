'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

var is = require('./util/ElementHelper').is;

var SUPPORTED_ELEMENTS = [
  'bpmn:EndEvent',
  'bpmn:ExclusiveGateway',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
  'bpmn:ParallelGateway',
  'bpmn:SequenceFlow',
  'bpmn:StartEvent',
  'bpmn:Task'
];

var IGNORED_ELEMENTS = [ 
  'bpmn:Process'
];

function isLabel(element) {
  return element.labelTarget;
}

function CheckElementSupport(eventBus, elementRegistry, overlays, modeling, canvas) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._modeling = modeling;

  var canvasParent = this.canvasParent = canvas.getContainer().parentNode;

  eventBus.on('tokenSimulation.createToken', 20000, function() {
    self.removeAllWarnings();

    if (!self.allElementsSupported()) {
      self.showWarnings();

      eventBus.fire('tokenSimulation.showNotification', {
        text: 'Can\'t simulate, not all elements supported',
        notificationType: 'warning'
      });

      domClasses(canvasParent).add('warning');
      
      return true;
    }
  });

  eventBus.on('tokenSimulation.switchMode', 10000, function(context) {
    var mode = context.mode;

    if (mode === 'modeling') {
      self.removeAllWarnings();

      domClasses(canvasParent).remove('warning');
    }
  });
}

CheckElementSupport.prototype.allElementsSupported = function() {
  var allElementsSupported = true;

  this._elementRegistry.forEach(function(element) {
    if (!is(element, IGNORED_ELEMENTS) 
        && !is(element, SUPPORTED_ELEMENTS)
        && !isLabel(element)
    ) {
      allElementsSupported = false;
    }
  });

  return allElementsSupported;
};

CheckElementSupport.prototype.showWarnings = function(elements) {
  var self = this;

  this._elementRegistry.forEach(function(element) {
    if (!is(element, IGNORED_ELEMENTS) 
        && !is(element, SUPPORTED_ELEMENTS)
        && !isLabel(element)
    ) {
      self.showWarning(element);

      console.log(element.type + ' not supported');
    }
  });
};

CheckElementSupport.prototype.showWarning = function(element) {
  var position = {
    top: 0,
    right: 0
  };

  this._overlays.add(element, 'element-support-warning', {
    position: position,
    html: domify('<div class="element-support-warning"><i class="fa fa-exclamation-triangle"></i></div>')
  });
};

CheckElementSupport.prototype.removeAllWarnings = function() {
  this._overlays.remove({ type: 'element-support-warning' });
};

CheckElementSupport.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'modeling', 'canvas' ];

module.exports = CheckElementSupport;