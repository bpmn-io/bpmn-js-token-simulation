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

const FILL_COLOR = '--token-simulation-silver-base-97';
const STROKE_COLOR = '--token-simulation-green-base-44';

const ID = 'show-scopes';

const VERY_HIGH_PRIORITY = 3000;


export default function ShowScopes(
    eventBus,
    canvas,
    scopeFilter,
    elementColors,
    simulationStyles) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;
  this._elementColors = elementColors;
  this._simulationStyles = simulationStyles;

  this._highlight = null;

  this._init();

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    const active = event.active;

    if (active) {
      domClasses(this._container).remove('hidden');
    } else {
      domClasses(this._container).add('hidden');
      domClear(this._container);

      this.unhighlightScope();
    }
  });

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    const allElements = this.getScopeElements();

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      domClasses(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
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
  this._container = domify('<div class="bts-scopes hidden"></div>');

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
    <div data-scope-id="${scope.id}" class="bts-scope"
         title="View Process Instance ${scope.id}" ${colorMarkup}>
      ${scope.getTokens()}
    </div>
  `);

  domEvent.bind(html, 'click', () => {
    this._scopeFilter.toggle(scope);
  });

  domEvent.bind(html, 'mouseenter', () => {
    this.highlightScope(scopeElement);
  });

  domEvent.bind(html, 'mouseleave', () => {
    this.unhighlightScope();
  });

  if (!this._scopeFilter.isShown(scope)) {
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
};

ShowScopes.prototype.removeAllInstances = function() {
  this._container.innerHTML = '';
};

ShowScopes.prototype.highlightScope = function(element) {

  this.unhighlightScope();

  this._highlight = element;

  this._elementColors.add(element, ID, this._getHighlightColors(), VERY_HIGH_PRIORITY);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).add('highlight');
  }
};

ShowScopes.prototype.unhighlightScope = function() {

  if (!this._highlight) {
    return;
  }

  const element = this._highlight;

  this._elementColors.remove(element, ID);

  if (!element.parent) {
    domClasses(this._canvas.getContainer()).remove('highlight');
  }

  this._highlight = null;
};

ShowScopes.prototype._getHighlightColors = function() {
  return {
    fill: this._simulationStyles.get(FILL_COLOR),
    stroke: this._simulationStyles.get(STROKE_COLOR)
  };
};

ShowScopes.$inject = [
  'eventBus',
  'canvas',
  'scopeFilter',
  'elementColors',
  'simulationStyles'
];