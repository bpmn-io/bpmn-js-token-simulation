'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var elementHelper = require('../../util/ElementHelper'),
    getBusinessObject = elementHelper.getBusinessObject,
    is = elementHelper.is,
    isTypedEvent = elementHelper.isTypedEvent;

var events = require('../../util/EventHelper'),
    GENERATE_TOKEN_EVENT = events.GENERATE_TOKEN_EVENT,
    CONSUME_TOKEN_EVENT = events.CONSUME_TOKEN_EVENT,
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT = events.RESET_SIMULATION_EVENT,
    PROCESS_INSTANCE_CREATED_EVENT = events.PROCESS_INSTANCE_CREATED_EVENT;

function getElementName(element) {
  return (element && element.businessObject.name);
}

function Log(eventBus, notifications, tokenSimulationPalette, canvas) {
  var self = this;

  this._notifications = notifications;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._canvas = canvas;

  this._init();

  eventBus.on(GENERATE_TOKEN_EVENT, function(context) {
    var element = context.element,
        elementName = getElementName(element);

    if (is(element, 'bpmn:StartEvent')) {
      self.log(elementName || 'Start Event', 'info', 'bpmn-icon-start-event-none');
    } else if (is(element, 'bpmn:Task')) {
      self.log(elementName || 'Task', 'info', 'bpmn-icon-task');
    } else if (is(element, 'bpmn:BusinessRuleTask')) {
      self.log(elementName || 'Business Rule Task', 'info', 'bpmn-icon-business-rule');
    } else if (is(element, 'bpmn:ManualTask')) {
      self.log(elementName || 'Manual Task', 'info', 'bpmn-icon-manual');
    } else if (is(element, 'bpmn:ScriptTask')) {
      self.log(elementName || 'Script Task', 'info', 'bpmn-icon-script');
    } else if (is(element, 'bpmn:ServiceTask')) {
      self.log(elementName || 'Service Task', 'info', 'bpmn-icon-service');
    } else if (is(element, 'bpmn:CallActivity')) {
      self.log(elementName || 'Call Activity', 'info', 'bpmn-icon-call-activity');
    } else if (is(element, 'bpmn:UserTask')) {
      self.log(elementName || 'User Task', 'info', 'bpmn-icon-user');
    } else if (is(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      var sequenceFlowName = getElementName(element.sequenceFlow);

      var text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(' <i class="fa fa-angle-right" aria-hidden="true"></i> ' + sequenceFlowName);
      }

      self.log(text, 'info', 'bpmn-icon-gateway-xor');
    } else if (is(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) {
      self.log(elementName || 'Intermediate Event', 'info', 'bpmn-icon-intermediate-event-none');
    }
  });

  eventBus.on(CONSUME_TOKEN_EVENT, function(context) {
    var element = context.element,
        elementName = getElementName(element);

    if (is(element, 'bpmn:EndEvent')) {

      if (isTypedEvent(getBusinessObject(element), 'bpmn:TerminateEventDefinition')) {
        self.log(elementName || 'Terminate End Event', 'info', 'bpmn-icon-end-event-terminate');
      } else {
        self.log(elementName || 'End Event', 'info', 'bpmn-icon-end-event-none');
      }
    }
  });

  eventBus.on(PROCESS_INSTANCE_CREATED_EVENT, function(context) {
    var processInstanceId = context.processInstanceId,
        parent = context.parent;

    if (is(parent, 'bpmn:Process')) {
      self.log('Process ' + processInstanceId + ' started', 'success', 'fa-check');
    } else {
      self.log('Subprocess ' + processInstanceId + ' started', 'info', 'fa-check');
    }
  });

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.emptyLog();

      domClasses(self.container).add('hidden');
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, function(context) {
    self.emptyLog();

    domClasses(self.container).add('hidden');
  });
}

Log.prototype._init = function() {
  var self = this;

  this.container = domify(
    '<div class="token-simulation-log hidden">' +
      '<div class="header">' +
        '<i class="fa fa-align-left"></i>' +
        '<button class="close">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<div class="content">' +
        '<p class="entry placeholder">No Entries</p>' +
      '</div>' +
    '</div>'
  );

  this.placeholder = domQuery('.placeholder', this.container);

  this.content = domQuery('.content', this.container);

  domEvent.bind(this.content, 'wheel', function(e) {
    e.stopPropagation();
  });

  domEvent.bind(this.content, 'mousedown', function(e) {
    e.stopPropagation();
  });

  this.close = domQuery('.close', this.container);

  domEvent.bind(this.close, 'click', function() {
    domClasses(self.container).add('hidden');
  });

  this.icon = domQuery('.fa-align-left', this.container);

  domEvent.bind(this.icon, 'click', function() {
    domClasses(self.container).add('hidden');
  });

  this._canvas.getContainer().appendChild(this.container);

  this.paletteEntry = domify('<div class="entry" title="Show Simulation Log"><i class="fa fa-align-left"></i></div>');

  domEvent.bind(this.paletteEntry, 'click', function() {
    domClasses(self.container).remove('hidden');
  });

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 3);
};

Log.prototype.toggle = function() {
  var container = this.container;

  if (domClasses(container).has('hidden')) {
    domClasses(container).remove('hidden');
  } else {
    domClasses(container).add('hidden');
  }
};

Log.prototype.log = function(text, type, icon) {
  domClasses(this.placeholder).add('hidden');

  var date = new Date();

  var dateString = date.toLocaleTimeString() + ':' + date.getUTCMilliseconds();

  this._notifications.showNotification(text, type, icon);

  var iconMarkup;

  if (!icon) {
    icon = 'fa-info';
  }

  if (icon.includes('bpmn')) {
    iconMarkup = '<span class="icon ' + icon + '">';
  } else {
    iconMarkup = '<i class="icon fa ' + icon + '"></i>';
  }

  var logEntry = domify('<p class="entry ' + type + '"><span class="date">' + dateString + '</span>' + iconMarkup + '</span>' + text + '</p>');

  this.content.appendChild(logEntry);

  this.content.scrollTop = this.content.scrollHeight;
};

Log.prototype.emptyLog = function() {
  while (this.content.firstChild) {
    this.content.removeChild(this.content.firstChild);
  }

  this.placeholder = domify('<p class="entry placeholder">No Entries</p>');

  this.content.appendChild(this.placeholder);
};

Log.$inject = [ 'eventBus', 'notifications', 'tokenSimulationPalette', 'canvas' ];

module.exports = Log;