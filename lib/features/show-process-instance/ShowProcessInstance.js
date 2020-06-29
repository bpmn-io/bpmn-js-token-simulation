'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query'),
    domClear = require('min-dom/lib/clear');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    PROCESS_INSTANCE_CREATED_EVENT = events.PROCESS_INSTANCE_CREATED_EVENT,
    PROCESS_INSTANCE_FINISHED_EVENT = events.PROCESS_INSTANCE_FINISHED_EVENT,
    PROCESS_INSTANCE_SHOWN_EVENT = events.PROCESS_INSTANCE_SHOWN_EVENT,
    PROCESS_INSTANCE_HIDDEN_EVENT = events.PROCESS_INSTANCE_HIDDEN_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT;

var FILL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--token-simulation-silver-base-97'),
    STROKE_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--token-simulation-green-base-44');

function isNull(value) {
  return value === null;
}

function ShowProcessInstance(
    eventBus,
    canvas,
    processInstanceSettings,
    processInstances,
    graphicsFactory,
    elementRegistry
) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._processInstanceSettings = processInstanceSettings;
  this._processInstances = processInstances;
  this._graphicsFactory = graphicsFactory;
  this._elementRegistry = elementRegistry;

  this.highlightedElement = null;

  this._init();

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      domClasses(self.container).add('hidden');
      domClear(self.container);

      if (!isNull(self.highlightedElement)) {
        self.removeHighlightFromProcess(self.highlightedElement.element);

        self.highlightedElement = null;
      }
    } else {
      domClasses(self.container).remove('hidden');
    }
  });

  eventBus.on(PROCESS_INSTANCE_CREATED_EVENT, function(context) {
    self.addInstance(context);
  });

  eventBus.on(PROCESS_INSTANCE_FINISHED_EVENT, function(context) {
    self.removeInstance(context);
  });

  eventBus.on(PROCESS_INSTANCE_SHOWN_EVENT, function(context) {
    self.setInstanceShown(context.processInstanceId);
  });

  eventBus.on(PROCESS_INSTANCE_HIDDEN_EVENT, function(context) {
    self.setInstanceHidden(context.processInstanceId);
  });

  eventBus.on(RESET_SIMULATION_EVENT, function() {
    self.removeAllInstances();
  });
}

ShowProcessInstance.prototype._init = function() {
  this.container = domify('<div class="process-instances hidden"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

ShowProcessInstance.prototype.addInstance = function(context) {
  var self = this;

  var processInstanceId = context.processInstanceId,
      parent = context.parent;

  var element = domify(
    '<div id="instance-' + processInstanceId + '" class="process-instance" title="View Process Instance ' + processInstanceId + '">' +
    processInstanceId +
    '</div>'
  );

  domEvent.bind(element, 'click', function() {
    var processInstancesWithParent = self._processInstances.getProcessInstances(parent);

    processInstancesWithParent.forEach(function(processInstance) {
      self._processInstanceSettings.hideProcessInstance(processInstance.processInstanceId);
    });

    self._processInstanceSettings.showProcessInstance(processInstanceId, parent);
  });

  domEvent.bind(element, 'mouseenter', function() {
    self.highlightedElement = {
      element: parent,
      stroke: parent.businessObject.di.get('stroke'),
      fill: parent.businessObject.di.get('fill')
    };

    self.addHighlightToProcess(parent);
  });

  domEvent.bind(element, 'mouseleave', function() {
    self.removeHighlightFromProcess(parent);

    self.highlightedElement = null;
  });

  this.container.appendChild(element);
};

ShowProcessInstance.prototype.removeInstance = function(context) {
  var processInstanceId = context.processInstanceId;

  var element = domQuery('#instance-' + processInstanceId, this.container);

  if (element) {
    element.remove();
  }
};

ShowProcessInstance.prototype.removeAllInstances = function() {
  this.container.innerHTML = '';
};

ShowProcessInstance.prototype.setInstanceShown = function(processInstanceId) {
  var element = domQuery('#instance-' + processInstanceId, this.container);

  if (element) {
    domClasses(element).add('active');
  }
};

ShowProcessInstance.prototype.setInstanceHidden = function(processInstanceId) {
  var element = domQuery('#instance-' + processInstanceId, this.container);

  if (element) {
    domClasses(element).remove('active');
  }
};

ShowProcessInstance.prototype.addHighlightToProcess = function(element) {
  this.setColor(element, STROKE_COLOR, FILL_COLOR);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).add('highlight');
  }
};

ShowProcessInstance.prototype.removeHighlightFromProcess = function(element) {
  if (isNull(this.highlightedElement)) {
    return;
  }

  this.setColor(element, this.highlightedElement.stroke, this.highlightedElement.fill);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).remove('highlight');
  }
};

ShowProcessInstance.prototype.setColor = function(element, stroke, fill) {
  var businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  var gfx = this._elementRegistry.getGraphics(element);

  this._graphicsFactory.update('connection', element, gfx);
};

ShowProcessInstance.$inject = [
  'eventBus',
  'canvas',
  'processInstanceSettings',
  'processInstances',
  'graphicsFactory',
  'elementRegistry'
];

module.exports = ShowProcessInstance;