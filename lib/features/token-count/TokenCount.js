import {
  domify,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import {
  is
} from '../../util/ElementHelper';

import {
  ELEMENT_CHANGED_EVENT,
  SCOPE_FILTER_CHANGED_EVENT
} from '../../util/EventHelper';


const OFFSET_BOTTOM = 10;
const OFFSET_LEFT = -15;

const LOW_PRIORITY = 500;

const STYLE = getComputedStyle(document.documentElement);

const DEFAULT_PRIMARY_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');
const DEFAULT_AUXILIARY_COLOR = STYLE.getPropertyValue('--token-simulation-white');


export default function TokenCount(
    eventBus, overlays,
    simulator, scopeFilter) {

  this._overlays = overlays;
  this._scopeFilter = scopeFilter;
  this._simulator = simulator;

  this.overlayIds = {};

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {

    const {
      element
    } = event;

    this.removeTokenCounts(element);
    this.addTokenCounts(element);
  });

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    const allElements = domQueryAll('.token-count[data-scope-id]', overlays._overlayRoot);

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      domClasses(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
    }
  });
}

TokenCount.prototype.addTokenCounts = function(element) {

  if (is(element, 'bpmn:MessageFlow') || is(element, 'bpmn:SequenceFlow')) {
    return;
  }

  const scopes = this._simulator.findScopes(scope => {
    return (
      !scope.destroyed &&
      scope.children.some(c => !c.destroyed && c.element === element && !c.children.length)
    );
  });

  this.addTokenCount(element, scopes);
};

TokenCount.prototype.addTokenCount = function(element, scopes) {
  if (!scopes.length) {
    return;
  }

  const defaultColors = {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  const tokenMarkup = scopes.map(scope => {
    const colors = scope.colors || defaultColors;

    return `
      <div data-scope-id="${scope.id}" class="token-count waiting ${this._scopeFilter.isShown(scope) ? '' : 'inactive' }"
           style="color: ${colors.auxiliary}; background: ${ colors.primary }">
        ${scope.getTokensByElement(element)}
      </div>
    `;
  }).join('');

  const html = domify(`
    <div class="token-count-parent">
      ${tokenMarkup}
    </div>
  `);

  const position = { bottom: OFFSET_BOTTOM, left: OFFSET_LEFT };

  const overlayId = this._overlays.add(element, 'token-count', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });

  this.overlayIds[element.id] = overlayId;
};

TokenCount.prototype.removeTokenCounts = function(element) {
  this.removeTokenCount(element);
};

TokenCount.prototype.removeTokenCount = function(element) {
  const overlayId = this.overlayIds[element.id];

  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this.overlayIds[element.id];
};

TokenCount.$inject = [
  'eventBus',
  'overlays',
  'simulator',
  'scopeFilter'
];