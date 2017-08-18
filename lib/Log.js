'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var is = require('./util/ElementHelper').is;

function getName(element) {
  return (element && element.businessObject.name);
}

function Log(eventBus, canvas) {
  var self = this;

  this._eventBus = eventBus;
  this._canvas = canvas;

  this.events = [];

  this._init();

  eventBus.on('tokenSimulation.tokenProcessed', function(event) {
    var element = event.element;

    if (!element) return;

    var elementName = getName(element);

    if (is(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      var icon = 'bpmn-icon-gateway-xor';
      var sequenceFlowName = getName(element.configuredSequenceFlow);

      var text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(' <i class="fa fa-angle-right" aria-hidden="true"></i> ' + sequenceFlowName);
      }
      self.log(text, icon);

    } else if (is(element, 'bpmn:Task')) {
      self.log(elementName || 'Task', 'bpmn-icon-task');

    } else if (is(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) {
      self.log(elementName || 'Intermediate Event', 'bpmn-icon-intermediate-event-none');
    }
  });

  eventBus.on('tokenSimulation.createToken', function(event) {
    var element = event.element;
    if (!element) return;

    var elementName = getName(element);

    if (is(element, ['bpmn:StartEvent'])) {
      self.log(elementName || 'Start Event', 'bpmn-icon-start-event-none');
    }
  });

  eventBus.on('tokenSimulation.tokenArrived', function(event) {
    var element = event.element;
    if (!element) return;

    var elementName = getName(element);

    if (is(element, ['bpmn:EndEvent'])) {
      self.log(elementName || 'Start Event', 'bpmn-icon-end-event-none');
    }
  });
}

Log.prototype._init = function() {
  var self = this;

  this.tint = domify('<div class="tint hidden"></div>');

  this.container = domify(`
    <div class="token-simulation-log hidden">
      <div class="head">
        Log
        <button class="close">
          <i class="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="content"></div>
    </div>`
  );

  this.content = domQuery('.content', this.container);

  domEvent.bind(this.content, 'scroll', function(e) {
    e.stopPropagation();
  });

  this.closeButton = domQuery('.close', this.container);

  domEvent.bind(this.closeButton, 'click', function() {
    domClasses(self.container).add('hidden');
    domClasses(self.tint).add('hidden');
  });

  this.openButton = domify('<div class="simulation-button hidden open-log"><i class="fa fa-file-text-o" aria-hidden="true"></i></div>');

  domEvent.bind(this.openButton, 'click', function() {
    domClasses(self.container).remove('hidden');
    domClasses(self.tint).remove('hidden');
  });

  this._canvas.getContainer().appendChild(this.tint);
  this._canvas.getContainer().appendChild(this.container);
  this._canvas.getContainer().appendChild(this.openButton);
};

Log.prototype.log = function(text, icon) {
  if (!text.trim().length) {
    return;
  }

  var timestamp = new Date().toUTCString();

  this.events.push({
    timestamp: timestamp,
    text: text
  });

  this._eventBus.fire('tokenSimulation.showNotification', {
    text: text,
    notificationType: 'info',
    icon: icon
  });

  var logEntry = domify(`
    <p class="log-entry ${icon}">
      ${text}
    </p>`
  );

  this.content.appendChild(logEntry);

  this.content.scrollTop = this.content.scrollHeight;
};

Log.prototype.getLog = function() {
  return this.events;
};

Log.$inject = [ 'eventBus', 'canvas' ];

module.exports = Log;
