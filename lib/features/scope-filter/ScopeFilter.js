import {
  SCOPE_FILTER_CHANGED_EVENT,
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT
} from '../../util/EventHelper';

const DEFAULT_SCOPE_FILTER = (s) => true;


export default function ScopeFilter(eventBus, simulator) {
  this._eventBus = eventBus;
  this._simulator = simulator;

  this._filter = DEFAULT_SCOPE_FILTER;

  eventBus.on([
    TOGGLE_MODE_EVENT,
    RESET_SIMULATION_EVENT
  ], () => {
    this._filter = DEFAULT_SCOPE_FILTER;
  });
}

ScopeFilter.prototype.toggle = function(scope) {

  const setFilter = this._scope !== scope;

  this._scope = setFilter ? scope : null;

  this._filter =
    this._scope
      ? s => isAncestor(this._scope, s)
      : s => true;

  this._eventBus.fire(SCOPE_FILTER_CHANGED_EVENT, {
    filter: this._filter,
    scope: this._scope
  });
};

ScopeFilter.prototype.isShown = function(scope) {

  if (typeof scope === 'string') {
    scope = this._simulator.findScope(s => s.id === scope);
  }

  return scope && this._filter(scope);
};

ScopeFilter.prototype.findScope = function(options) {
  return this._simulator.findScopes(options).filter(s => this.isShown(s))[0];
};

ScopeFilter.$inject = [
  'eventBus',
  'simulator'
];

function isAncestor(parent, scope) {
  do {
    if (parent === scope) {
      return true;
    }
  } while ((scope = scope.parent));

  return false;
}