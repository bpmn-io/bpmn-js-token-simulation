import {
  PauseIcon,
  RemovePauseIcon
} from '../../../icons';

import {
  classes as domClasses,
  domify
} from 'min-dom';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { getElementLabel } from '../../../util/ElementHelper';


export default function PauseHandler(contextPads, simulator) {
  this._simulator = simulator;

  contextPads.register('bpmn:Activity', this);
}

PauseHandler.prototype.createContextPads = function(element) {

  if (
    is(element, 'bpmn:ReceiveTask') || (
      is(element, 'bpmn:SubProcess') && getBusinessObject(element).triggeredByEvent
    )
  ) {
    return [];
  }

  return [
    this.createPauseContextPad(element)
  ];
};

PauseHandler.prototype.createPauseContextPad = function(element) {

  const contexts = () => this._findSubscriptions({
    element
  });

  const wait = this._isPaused(element);

  const elementLabel = getElementLabel(element);
  const shortLabel = wait ? 'Remove pause point' : 'Add pause point';
  const ariaLabel = `${ shortLabel } to: ${ elementLabel }`;

  const html = `
    <button class="bts-context-pad ${ wait ? '' : 'show-hover' }" title="${ shortLabel }" aria-label="${ ariaLabel }" aria-pressed="${ wait }">
      ${ (wait ? RemovePauseIcon : PauseIcon)('show-hover') }
      ${ PauseIcon('hide-hover') }
    </button>
  `;

  const action = () => {
    this._togglePaused(element);
  };

  const update = (htmlEl) => {
    const paused = this._isPaused(element);
    const updatedShort = paused ? 'Remove pause point' : 'Add pause point';
    const updatedAria = `${ updatedShort } to: ${ elementLabel }`;
    htmlEl.title = updatedShort;
    htmlEl.setAttribute('aria-label', updatedAria);
    htmlEl.setAttribute('aria-pressed', String(paused));
    domClasses(htmlEl).toggle('show-hover', !paused);

    const showHoverSpan = htmlEl.querySelector('.bts-icon.show-hover');
    if (showHoverSpan) {
      const newSpan = domify((paused ? RemovePauseIcon : PauseIcon)('show-hover'));
      showHoverSpan.parentNode.replaceChild(newSpan, showHoverSpan);
    }
  };

  return {
    key: 'pause',
    action,
    element,
    hideContexts: contexts,
    html,
    update
  };
};

PauseHandler.prototype._isPaused = function(element) {

  const {
    wait
  } = this._simulator.getConfig(element);

  return wait;
};

PauseHandler.prototype._togglePaused = function(element) {
  const wait = !this._isPaused(element);

  this._simulator.waitAtElement(element, wait);
};

PauseHandler.prototype._findSubscriptions = function(options) {
  return this._simulator.findSubscriptions(options);
};

PauseHandler.$inject = [
  'contextPads',
  'simulator'
];