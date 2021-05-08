import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject,
  is,
  isTypedEvent
} from '../../util/ElementHelper';

import {
  GENERATE_TOKEN_EVENT,
  CONSUME_TOKEN_EVENT,
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  SCOPE_DESTROYED_EVENT,
  SCOPE_CREATE_EVENT
} from '../../util/EventHelper';

function getElementName(element) {
  return (element && element.businessObject.name);
}


export default function Log(eventBus, notifications, tokenSimulationPalette, canvas) {
  var self = this;

  this._notifications = notifications;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._canvas = canvas;

  this._init();

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      destroyContext,
      element: scopeElement
    } = scope;

    const {
      reason
    } = destroyContext;

    const isCompletion = reason === 'complete';

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant',
      'bpmn:SubProcess'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    const isSubProcess = is(scopeElement, 'bpmn:SubProcess');

    const text = `${
      isSubProcess ? 'Subprocess' : 'Process'
    } ${
      isCompletion ? 'finished' : 'canceled'
    }`;

    this.log({
      text,
      icon: 'fa-check-circle',
      scope
    });
  });

  eventBus.on(SCOPE_CREATE_EVENT, event => {
    const {
      scope
    } = event;

    const {
      element: scopeElement
    } = scope;

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant',
      'bpmn:SubProcess'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    const isSubProcess = is(scopeElement, 'bpmn:SubProcess');

    const text = `${
      isSubProcess ? 'Subprocess' : 'Process'
    } started`;

    this.log({
      text,
      icon: 'fa-check-circle',
      scope
    });
  });

  eventBus.on(GENERATE_TOKEN_EVENT, function(context) {
    var element = context.element,
        elementName = getElementName(element);

    if (is(element, 'bpmn:BusinessRuleTask')) {
      self.log({
        text: elementName || 'Business Rule Task',
        icon: 'bpmn-icon-business-rule'
      });
    } else if (is(element, 'bpmn:CallActivity')) {
      self.log({
        text: elementName || 'Call Activity',
        icon: 'bpmn-icon-call-activity'
      });
    } else if (is(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) {
      self.log({
        text: elementName || 'Intermediate Event',
        icon: 'bpmn-icon-intermediate-event-none'
      });
    } else if (is(element, 'bpmn:ManualTask')) {
      self.log({
        text: elementName || 'Manual Task',
        icon: 'bpmn-icon-manual'
      });
    } else if (is(element, 'bpmn:ScriptTask')) {
      self.log({
        text: elementName || 'Script Task',
        icon: 'bpmn-icon-script'
      });
    } else if (is(element, 'bpmn:ServiceTask')) {
      self.log({
        text: elementName || 'Service Task',
        icon: 'bpmn-icon-service'
      });
    } else if (is(element, 'bpmn:StartEvent')) {
      self.log({
        text: elementName || 'Start Event',
        icon: 'bpmn-icon-start-event-none'
      });
    } else if (is(element, 'bpmn:Task')) {
      self.log({
        text: elementName || 'Task',
        icon: 'bpmn-icon-task'
      });
    } else if (is(element, 'bpmn:UserTask')) {
      self.log({
        text: elementName || 'User Task',
        icon: 'bpmn-icon-user'
      });
    } else if (is(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      var sequenceFlowName = getElementName(element.sequenceFlow);

      var text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(' <i class="fa fa-angle-right" aria-hidden="true"></i> ' + sequenceFlowName);
      }

      self.log({
        text,
        icon: 'bpmn-icon-gateway-xor'
      });
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

  eventBus.on(TOGGLE_MODE_EVENT, function(context) {
    var simulationModeActive = context.simulationModeActive;

    if (!simulationModeActive) {
      self.clear();

      domClasses(self.container).add('hidden');
    }
  });

  eventBus.on(RESET_SIMULATION_EVENT, function(context) {
    self.clear();

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

  this.paletteEntry = domify(`
    <div class="entry" title="Show Simulation Log">
      <i class="fa fa-align-left"></i>
    </div>
  `);

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

Log.prototype.log = function(options) {

  const {
    text,
    type = 'info',
    icon = 'fa-info',
    scope
  } = options;

  domClasses(this.placeholder).add('hidden');

  var date = new Date();

  var dateString = date.toLocaleTimeString() + ':' + date.getUTCMilliseconds();

  this._notifications.showNotification(options);

  const iconMarkup = `<i class="${icon} ${
    icon.includes('bpmn') ? '' : 'fa'
  } ${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="background: ${colors.primary}; color: ${colors.auxiliary}"` : '';

  var logEntry = domify(`
    <p class="entry ${ type }">
      <span class="date">${ dateString }</span>
      <span class="icon">${iconMarkup}</span>
      <span class="text">${text}</span>
      ${ scope ? `<span class="scope" ${colorMarkup}>${scope.id}</span>` : '' }
    </p>
  `);

  this.content.appendChild(logEntry);

  this.content.scrollTop = this.content.scrollHeight;
};

Log.prototype.clear = function() {
  while (this.content.firstChild) {
    this.content.removeChild(this.content.firstChild);
  }

  this.placeholder = domify('<p class="entry placeholder">No Entries</p>');

  this.content.appendChild(this.placeholder);
};

Log.$inject = [
  'eventBus',
  'notifications',
  'tokenSimulationPalette',
  'canvas'
];