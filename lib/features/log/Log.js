import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery,
  queryAll as domQueryAll,
  delegate as domDelegate
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
  SCOPE_CREATE_EVENT,
  SCOPE_FILTER_CHANGED_EVENT
} from '../../util/EventHelper';

function getElementName(element) {
  return (element && element.businessObject.name);
}


export default function Log(
    eventBus, notifications,
    tokenSimulationPalette, canvas,
    showScopes, simulator) {

  this._notifications = notifications;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._canvas = canvas;
  this._showScopes = showScopes;

  this._scopeShown = (s) => true;

  this._init();

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    const {
      scopeShown
    } = event;

    this._scopeShown = scopeShown;

    const scopes = simulator.scopes;

    for (const scope of scopes) {
      const entryElements = domQueryAll(`.entry[data-scope-id="${scope.id}"]`, this._container);

      for (const entryElement of entryElements) {
        domClasses(entryElement).toggle('inactive', !scopeShown(scope));
      }
    }
  });

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

  // TODO(nikku): Fixup + refactor
  eventBus.on(GENERATE_TOKEN_EVENT, context => {
    const element = context.element,
          elementName = getElementName(element);

    if (is(element, 'bpmn:BusinessRuleTask')) {
      this.log({
        text: elementName || 'Business Rule Task',
        icon: 'bpmn-icon-business-rule'
      });
    } else if (is(element, 'bpmn:CallActivity')) {
      this.log({
        text: elementName || 'Call Activity',
        icon: 'bpmn-icon-call-activity'
      });
    } else if (is(element, ['bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent'])) {
      this.log({
        text: elementName || 'Intermediate Event',
        icon: 'bpmn-icon-intermediate-event-none'
      });
    } else if (is(element, 'bpmn:ManualTask')) {
      this.log({
        text: elementName || 'Manual Task',
        icon: 'bpmn-icon-manual'
      });
    } else if (is(element, 'bpmn:ScriptTask')) {
      this.log({
        text: elementName || 'Script Task',
        icon: 'bpmn-icon-script'
      });
    } else if (is(element, 'bpmn:ServiceTask')) {
      this.log({
        text: elementName || 'Service Task',
        icon: 'bpmn-icon-service'
      });
    } else if (is(element, 'bpmn:StartEvent')) {
      this.log({
        text: elementName || 'Start Event',
        icon: 'bpmn-icon-start-event-none'
      });
    } else if (is(element, 'bpmn:Task')) {
      this.log({
        text: elementName || 'Task',
        icon: 'bpmn-icon-task'
      });
    } else if (is(element, 'bpmn:UserTask')) {
      this.log({
        text: elementName || 'User Task',
        icon: 'bpmn-icon-user'
      });
    } else if (is(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      const sequenceFlowName = getElementName(element.sequenceFlow);

      let text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(' <i class="fa fa-angle-right" aria-hidden="true"></i> ' + sequenceFlowName);
      }

      this.log({
        text,
        icon: 'bpmn-icon-gateway-xor'
      });
    }
  });

  // TODO(nikku): Fixup + refactor
  eventBus.on(CONSUME_TOKEN_EVENT, function(context) {
    const element = context.element,
          elementName = getElementName(element);

    if (is(element, 'bpmn:EndEvent')) {

      if (isTypedEvent(getBusinessObject(element), 'bpmn:TerminateEventDefinition')) {
        this.log(elementName || 'Terminate End Event', 'info', 'bpmn-icon-end-event-terminate');
      } else {
        this.log(elementName || 'End Event', 'info', 'bpmn-icon-end-event-none');
      }
    }
  });

  eventBus.on([
    TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT
  ], event => {
    this.clear();

    domClasses(this._container).add('hidden');

    this._scopesShown = (s) => true;
  });
}

Log.prototype._init = function() {
  this._container = domify(
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

  this._placeholder = domQuery('.placeholder', this._container);

  this._content = domQuery('.content', this._container);

  domEvent.bind(this._content, 'wheel', event => {
    event.stopPropagation();
  });

  domEvent.bind(this._content, 'mousedown', event => {
    event.stopPropagation();
  });

  this._close = domQuery('.close', this._container);

  domEvent.bind(this._close, 'click', () => {
    domClasses(this._container).add('hidden');
  });

  this._icon = domQuery('.fa-align-left', this._container);

  domEvent.bind(this._icon, 'click', () => {
    domClasses(this._container).add('hidden');
  });

  this._canvas.getContainer().appendChild(this._container);

  this.paletteEntry = domify(`
    <div class="entry" title="Show Simulation Log">
      <i class="fa fa-align-left"></i>
    </div>
  `);

  domEvent.bind(this.paletteEntry, 'click', () => {
    domClasses(this._container).remove('hidden');
  });

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 3);
};

Log.prototype.toggle = function() {
  const container = this._container;

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

  domClasses(this._placeholder).add('hidden');

  const date = new Date();

  const dateString = date.toLocaleTimeString() + ':' + date.getUTCMilliseconds();

  this._notifications.showNotification(options);

  const iconMarkup = `<i class="${icon} ${
    icon.includes('bpmn') ? '' : 'fa'
  } ${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="background: ${colors.primary}; color: ${colors.auxiliary}"` : '';

  const logEntry = domify(`
    <p class="entry ${ type } ${scope && this._scopeShown(scope) ? '' : 'inactive'}" ${scope ? `data-scope-id="${scope.id}"` : '' }>
      <span class="date">${ dateString }</span>
      <span class="icon">${iconMarkup}</span>
      <span class="text">${text}</span>
      ${ scope ? `<span class="scope" data-scope-id="${scope.id}" ${colorMarkup}>${scope.id}</span>` : '' }
    </p>
  `);

  domDelegate.bind(logEntry, '.scope[data-scope-id]', 'click', event => {
    this._showScopes.toggleScope(scope);
  });

  this._content.appendChild(logEntry);

  this._content.scrollTop = this._content.scrollHeight;
};

Log.prototype.clear = function() {
  while (this._content.firstChild) {
    this._content.removeChild(this._content.firstChild);
  }

  this._placeholder = domify('<p class="entry placeholder">No Entries</p>');

  this._content.appendChild(this._placeholder);
};

Log.$inject = [
  'eventBus',
  'notifications',
  'tokenSimulationPalette',
  'canvas',
  'showScopes',
  'simulator'
];