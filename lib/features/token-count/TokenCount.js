import {
  domify
} from 'min-dom';

import {
  is
} from '../../util/ElementHelper';

import {
  ELEMENT_CHANGED_EVENT
} from '../../util/EventHelper';


const OFFSET_BOTTOM = 10;
const OFFSET_LEFT = -15;

const LOW_PRIORITY = 500;

const TOKEN_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--token-simulation-green-base-44');


export default function TokenCount(eventBus, overlays, simulator) {

  this._overlays = overlays;
  this._simulator = simulator;

  this.overlayIds = {};

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {

    const {
      element
    } = event;

    this.removeTokenCounts(element);
    this.addTokenCounts(element);
  });

  // TODO(nikku): restore scope filter
}

TokenCount.prototype.addTokenCounts = function(element) {

  if (is(element, 'bpmn:MessageFlow') || is(element, 'bpmn:SequenceFlow')) {
    return;
  }

  const scopes = this._simulator.scopes.filter(scope => {
    return (
      !scope.destroyed &&
      scope.getTokensByElement(element) > 0 &&
      !scope.children.some(childScope => childScope.element === element)
    );
  });

  this.addTokenCount(element, scopes);
};

TokenCount.prototype.addTokenCount = function(element, scopes) {
  if (!scopes.length) {
    return;
  }

  const tokenMarkup = scopes.map(scope => `
    <div class="token-count waiting" style="background: ${ scope.color || TOKEN_COLOR }">
      ${scope.getTokensByElement(element)}
    </div>
  `).join('');

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
  'simulator'
];