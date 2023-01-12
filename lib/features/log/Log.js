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
  escapeHTML
} from 'diagram-js/lib/util/EscapeUtil';

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  SCOPE_DESTROYED_EVENT,
  SCOPE_CREATE_EVENT,
  SCOPE_FILTER_CHANGED_EVENT,
  TRACE_EVENT
} from '../../util/EventHelper';

import {
  LogIcon,
  TimesIcon,
  TimesCircleIcon,
  CheckCircleIcon,
  AngleRightIcon,
  InfoIcon
} from '../../icons';


const ICON_INFO = InfoIcon();

function getElementName(element) {
  const name = element && element.businessObject.name;

  return name && escapeHTML(name);
}


export default function Log(
    eventBus, notifications,
    tokenSimulationPalette, canvas,
    scopeFilter, simulator) {

  this._notifications = notifications;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._init();

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {
    const allElements = domQueryAll('.bts-entry[data-scope-id]', this._container);

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      domClasses(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
    }
  });

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      element: scopeElement
    } = scope;

    const completed = scope.completed;

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
      isSubProcess ? (getElementName(scopeElement) || 'SubProcess') : 'Process'
    } ${
      completed ? 'finished' : 'canceled'
    }`;

    this.log({
      text,
      icon: completed ? CheckCircleIcon() : TimesCircleIcon(),
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
      isSubProcess ? (getElementName(scopeElement) || 'SubProcess') : 'Process'
    } started`;

    this.log({
      text,
      icon: CheckCircleIcon(),
      scope
    });
  });

  eventBus.on(TRACE_EVENT, event => {

    const {
      action,
      scope: elementScope,
      element
    } = event;

    if (action !== 'exit') {
      return;
    }

    const scope = elementScope.parent;

    const elementName = getElementName(element);

    if (is(element, 'bpmn:BusinessRuleTask')) {
      this.log({
        text: elementName || 'Business Rule Task',
        icon: 'bpmn-icon-business-rule',
        scope
      });
    } else if (is(element, 'bpmn:CallActivity')) {
      this.log({
        text: elementName || 'Call Activity',
        icon: 'bpmn-icon-call-activity',
        scope
      });
    } else if (is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
      this.log({
        text: elementName || 'Intermediate Event',
        icon: 'bpmn-icon-intermediate-event-none',
        scope
      });
    } if (is(element, 'bpmn:BoundaryEvent')) {
      this.log({
        text: elementName || 'Boundary Event',
        icon: 'bpmn-icon-intermediate-event-none',
        scope
      });
    } else if (is(element, 'bpmn:ManualTask')) {
      this.log({
        text: elementName || 'Manual Task',
        icon: 'bpmn-icon-manual',
        scope
      });
    } else if (is(element, 'bpmn:ScriptTask')) {
      this.log({
        text: elementName || 'Script Task',
        icon: 'bpmn-icon-script',
        scope
      });
    } else if (is(element, 'bpmn:ServiceTask')) {
      this.log({
        text: elementName || 'Service Task',
        icon: 'bpmn-icon-service',
        scope
      });
    } else if (is(element, 'bpmn:Task')) {
      this.log({
        text: elementName || 'Task',
        icon: 'bpmn-icon-task',
        scope
      });
    } else if (is(element, 'bpmn:UserTask')) {
      this.log({
        text: elementName || 'User Task',
        icon: 'bpmn-icon-user',
        scope
      });
    } else if (is(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      const sequenceFlowName = getElementName(element.sequenceFlow);

      let text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(` ${ AngleRightIcon() } ${ sequenceFlowName }`);
      }

      this.log({
        text,
        icon: 'bpmn-icon-gateway-xor',
        scope
      });
    } else if (is(element, 'bpmn:EndEvent')) {
      if (isTypedEvent(getBusinessObject(element), 'bpmn:TerminateEventDefinition')) {
        this.log({
          text: elementName || 'Terminate End Event',
          icon: 'bpmn-icon-end-event-terminate',
          scope
        });
      } else {
        this.log({
          text: elementName || 'End Event',
          icon: 'bpmn-icon-end-event-none',
          scope
        });
      }
    } else if (is(element, 'bpmn:StartEvent')) {
      this.log({
        text: elementName || 'Start Event',
        icon: 'bpmn-icon-start-event-none',
        scope
      });
    }
  });


  eventBus.on([
    TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT
  ], event => {
    this.clear();
    this.toggle(false);
  });
}

Log.prototype._init = function() {
  this._container = domify(`
    <div class="bts-log hidden djs-scrollable">
      <div class="bts-header">
        ${ LogIcon('bts-log-icon') }
        Simulation Log
        <button class="bts-close">
          ${ TimesIcon() }
        </button>
      </div>
      <div class="bts-content">
        <p class="bts-entry placeholder">No Entries</p>
      </div>
    </div>
  `);

  this._placeholder = domQuery('.bts-placeholder', this._container);

  this._content = domQuery('.bts-content', this._container);

  domEvent.bind(this._content, 'mousedown', event => {
    event.stopPropagation();
  });

  this._close = domQuery('.bts-close', this._container);

  domEvent.bind(this._close, 'click', () => {
    this.toggle(false);
  });

  this._icon = domQuery('.bts-log-icon', this._container);

  domEvent.bind(this._icon, 'click', () => {
    this.toggle();
  });

  this._canvas.getContainer().appendChild(this._container);

  this.paletteEntry = domify(`
    <div class="bts-entry" title="Toggle Simulation Log">
      ${ LogIcon() }
    </div>
  `);

  domEvent.bind(this.paletteEntry, 'click', () => {
    this.toggle();
  });

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 3);
};

Log.prototype.isShown = function() {
  const container = this._container;

  return !domClasses(container).has('hidden');
};

Log.prototype.toggle = function(shown = !this.isShown()) {
  const container = this._container;

  if (shown) {
    domClasses(container).remove('hidden');
  } else {
    domClasses(container).add('hidden');
  }
};

Log.prototype.log = function(options) {

  const {
    text,
    type = 'info',
    icon = ICON_INFO,
    scope
  } = options;

  const content = this._content;

  domClasses(this._placeholder).add('hidden');

  if (!this.isShown()) {
    this._notifications.showNotification(options);
  }

  const iconMarkup = icon.startsWith('<') ? icon : `<i class="${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="background: ${colors.primary}; color: ${colors.auxiliary}"` : '';

  const logEntry = domify(`
    <p class="bts-entry ${ type } ${
      scope && this._scopeFilter.isShown(scope) ? '' : 'inactive'
    }" ${
      scope ? `data-scope-id="${scope.id}"` : ''
    }>
      <span class="bts-icon">${iconMarkup}</span>
      <span class="bts-text" title="${ text }">${text}</span>
      ${
        scope
          ? `<span class="bts-scope" data-scope-id="${scope.id}" ${colorMarkup}>${scope.id}</span>`
          : ''
      }
    </p>
  `);

  domDelegate.bind(logEntry, '.bts-scope[data-scope-id]', 'click', event => {
    this._scopeFilter.toggle(scope);
  });

  // determine if the container should scroll,
  // because it is currently scrolled to the very bottom
  const shouldScroll = Math.abs(content.clientHeight + content.scrollTop - content.scrollHeight) < 2;

  content.appendChild(logEntry);

  if (shouldScroll) {
    content.scrollTop = content.scrollHeight;
  }
};

Log.prototype.clear = function() {
  while (this._content.firstChild) {
    this._content.removeChild(this._content.firstChild);
  }

  this._placeholder = domify('<p class="bts-entry placeholder">No Entries</p>');

  this._content.appendChild(this._placeholder);
};

Log.$inject = [
  'eventBus',
  'notifications',
  'tokenSimulationPalette',
  'canvas',
  'scopeFilter',
  'simulator'
];