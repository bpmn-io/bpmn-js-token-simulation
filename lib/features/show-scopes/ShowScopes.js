import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery,
  queryAll as domQueryAll,
  clear as domClear
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT,
  SCOPE_CREATE_EVENT,
  SCOPE_CHANGED_EVENT,
  SCOPE_FILTER_CHANGED_EVENT,
  SCOPE_DESTROYED_EVENT,
  RESET_SIMULATION_EVENT,
} from '../../util/EventHelper';

const STYLE = getComputedStyle(document.documentElement);

const FILL_COLOR = STYLE.getPropertyValue('--token-simulation-silver-base-97');
const STROKE_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');


export default function ShowScopes(
    eventBus,
    canvas,
    graphicsFactory,
    elementRegistry) {

  this._eventBus = eventBus;
  this._canvas = canvas;
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

  eventBus.on(RESET_SIMULATION_EVENT, () => {
    this.removeAllInstances();
  });
}

ShowScopes.prototype._init = function() {
  this._container = domify('<div class="token-simulation-scopes hidden"></div>');

  this._canvas.getContainer().appendChild(this._container);
};

ShowScopes.prototype.addScope = function(scope) {

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
    this.toggleScope(scope);
  });

  domEvent.bind(html, 'mouseenter', () => {
    this.highlightScope(scopeElement);
  });

  domEvent.bind(html, 'mouseleave', () => {
    this.unhighlightScope();
  });

  if (this._filterScope) {
    domClasses(html).add('inactive');
  }

  this._container.appendChild(html);
};

ShowScopes.prototype.getScopeElements = function() {
  return domQueryAll('[data-scope-id]', this._container);
};

ShowScopes.prototype.getScopeElement = function(scope) {
  return domQuery(`[data-scope-id="${scope.id}"]`, this._container);
};

ShowScopes.prototype.updateScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.textContent = scope.getTokens();
  }
};

ShowScopes.prototype.removeScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.remove();
  }

  if (this._filterScope === scope) {
    this.toggleScope(scope);
  }
};

ShowScopes.prototype.removeAllInstances = function() {
  this._container.innerHTML = '';
};

ShowScopes.prototype.toggleScope = function(scope) {

  const filter = this._filterScope !== scope;

  const scopeElement = this.getScopeElement(scope);

  const scopeElements = this.getScopeElements();

  for (const element of scopeElements) {
    domClasses(element).toggle('inactive', filter && element !== scopeElement);
  }

  this._filterScope = filter ? scope : null;

  this._eventBus.fire(SCOPE_FILTER_CHANGED_EVENT, {
    scopeShown: filter
      ? (s => s === scope)
      : (s => true)
  });
};

ShowScopes.prototype.highlightScope = function(element) {

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

ShowScopes.prototype.unhighlightScope = function() {

  if (!this._highlight) {
    return;
  }

  const {
    element,
    stroke,
    fill
  } = this._highlight;

  this.setColor(element, stroke, fill);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).remove('highlight');
  }

  this._highlight = null;
};

ShowScopes.prototype.setColor = function(element, stroke, fill) {
  var businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  var gfx = this._elementRegistry.getGraphics(element);

  this._graphicsFactory.update('connection', element, gfx);
};

ShowScopes.$inject = [
  'eventBus',
  'canvas',
  'graphicsFactory',
  'elementRegistry'
];