import {
  PauseIcon,
  RemovePauseIcon
} from '../../../icons';


export default function PauseHandler(simulator) {
  this._simulator = simulator;
}

PauseHandler.prototype.createContextPads = function(element) {

  return [
    this.createPauseContextPad(element)
  ];
};

PauseHandler.prototype.createPauseContextPad = function(element) {

  const scopes = () => this._findScopes({
    element
  });

  // only show if no active scope
  if (scopes().length) {
    return;
  }

  const wait = this._isPaused(element);

  const html = `
    <div class="context-pad ${ wait ? '' : 'show-hover' }" title="${ wait ? 'Remove' : 'Add' } pause point">
      ${ (wait ? RemovePauseIcon : PauseIcon)('show-hover') }
      ${ PauseIcon('hide-hover') }
    </div>
  `;

  const action = () => {

    if (scopes().length) {
      return;
    }

    this._togglePaused(element);
  };

  return {
    action,
    element,
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

PauseHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

PauseHandler.$inject = [
  'simulator'
];