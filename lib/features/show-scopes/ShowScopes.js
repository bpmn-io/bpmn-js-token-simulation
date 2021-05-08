import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery,
  clear as domClear
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT,
  SCOPE_SHOWN_EVENT,
  SCOPE_HIDDEN_EVENT,
  SCOPE_CREATE_EVENT,
  SCOPE_CHANGED_EVENT,
  SCOPE_DESTROYED_EVENT,
  RESET_SIMULATION_EVENT,
} from '../../util/EventHelper';

const STYLE = getComputedStyle(document.documentElement);

const FILL_COLOR = STYLE.getPropertyValue('--token-simulation-silver-base-97');
const STROKE_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');


function isNull(value) {
  return value === null;
}

export default function ShowProcessInstance(
    eventBus,
    canvas,
    processInstanceSettings,
    processInstances,
    graphicsFactory,
    elementRegistry) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._processInstanceSettings = processInstanceSettings;
  this._processInstances = processInstances;
  this._graphicsFactory = graphicsFactory;
  this._elementRegistry = elementRegistry;

  this._highlight = null;

  this._init();

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    const simulationModeActive = event.simulationModeActive;

    if (simulationModeActive) {
      domClasses(this._container).remove('hidden');
    } else {
      domClasses(this._container).add('hidden');
      domClear(this._container);

      this.unhighlightScope();
    }
  });

  eventBus.on(SCOPE_CREATE_EVENT, event => {
    this.addScope(event.scope);
  });

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    this.removeScope(event.scope);
  });

  eventBus.on(SCOPE_CHANGED_EVENT, event => {
    this.updateScope(event.scope);
  });

  eventBus.on(SCOPE_SHOWN_EVENT, event => {
    this.showScope(event.scope);
  });

  eventBus.on(SCOPE_HIDDEN_EVENT, event => {
    this.hideScope(event.scope);
  });

  eventBus.on(RESET_SIMULATION_EVENT, () => {
    this.removeAllInstances();
  });
}

ShowProcessInstance.prototype._init = function() {
  this._container = domify('<div class="token-simulation-scopes hidden"></div>');

  this._canvas.getContainer().appendChild(this._container);
};

ShowProcessInstance.prototype.addScope = function(scope) {

  const processElements = [
    'bpmn:Process',
    'bpmn:SubProcess',
    'bpmn:Participant'
  ];

  const {
    element: scopeElement
  } = scope;

  if (!processElements.includes(scopeElement.type)) {
    return;
  }

  const colors = scope.colors;

  const colorMarkup = colors ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"` : '';

  const html = domify(`
    <div data-scope-id="${scope.id}" class="scope"
         title="View Process Instance ${scope.id}" ${colorMarkup}>
      ${scope.getTokens()}
    </div>
  `);

  domEvent.bind(html, 'click', () => {
    var processInstancesWithParent = self._processInstances.getProcessInstances(parent);

    processInstancesWithParent.forEach(function(processInstance) {
      self._processInstanceSettings.hideProcessInstance(processInstance.processInstanceId);
    });

    this._processInstanceSettings.showProcessInstance(processInstanceId, parent);
  });

  domEvent.bind(html, 'mouseenter', () => {
    this.highlightScope(scopeElement);
  });

  domEvent.bind(html, 'mouseleave', () => {
    this.unhighlightScope();
  });

  this._container.appendChild(html);
};

ShowProcessInstance.prototype.getScopeElement = function(scope) {
  return domQuery(`[data-scope-id="${scope.id}"]`, this._container);
}

ShowProcessInstance.prototype.updateScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.textContent = scope.getTokens();
  }
};

ShowProcessInstance.prototype.removeScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.remove();
  }
};

ShowProcessInstance.prototype.removeAllInstances = function() {
  this._container.innerHTML = '';
};

ShowProcessInstance.prototype.showScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    domClasses(element).add('active');
  }
};

ShowProcessInstance.prototype.hideScope = function(processInstanceId) {
  const element = this.getScopeElement(scope);

  if (element) {
    domClasses(element).remove('active');
  }
};

ShowProcessInstance.prototype.highlightScope = function(element) {

  this.unhighlightScope();

  this._highlight = {
    element,
    stroke: element.businessObject.di.get('stroke'),
    fill: element.businessObject.di.get('fill')
  };

  this.setColor(element, STROKE_COLOR, FILL_COLOR);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).add('highlight');
  }
};

ShowProcessInstance.prototype.unhighlightScope = function() {

  if (!this._highlight) {
    return;
  }

  const {
    element,
    stroke,
    fill
  } = this._highlight;

  this.setColor(element, this._highlight.stroke, this._highlight.fill);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).remove('highlight');
  }

  this._highlight = null;
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