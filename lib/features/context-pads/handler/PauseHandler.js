import {
  PauseIcon,
  RemovePauseIcon
} from '../../../icons';


import {
  is,
  getBusinessObject
} from '../../../util/ElementHelper';


export default function PauseHandler(simulator) {
  this._simulator = simulator;
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

  const html = `
    <div class="bts-context-pad ${ wait ? '' : 'show-hover' }" title="${ wait ? 'Remove' : 'Add' } pause point">
      ${ (wait ? RemovePauseIcon : PauseIcon)('show-hover') }
      ${ PauseIcon('hide-hover') }
    </div>
  `;

  const action = () => {
    this._togglePaused(element);
  };

  return {
    action,
    element,
    hideContexts: contexts,
    html
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
  'simulator'
];