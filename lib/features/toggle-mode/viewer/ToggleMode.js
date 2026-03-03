import {
  domify,
  classes as domClasses
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT
} from '../../../util/EventHelper';

import {
  ToggleOffIcon,
  ToggleOnIcon
} from '../../../icons';


export default function ToggleMode(eventBus, canvas, selection) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._active = false;

  eventBus.on('diagram.init', () => {
    this._canvasParent = this._canvas.getContainer().parentNode;

    this._init();
  });

  eventBus.on('import.parse.start', () => {

    if (this._active) {
      this.toggleMode(false);

      eventBus.once('import.done', () => {
        this.toggleMode(true);
      });
    }
  });
}

ToggleMode.prototype._init = function() {
  this._container = domify(`
    <button class="bts-toggle-mode">
      Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>
    </button>
  `);

  this._container.addEventListener('click', () => this.toggleMode());

  const canvasContainer = this._canvas.getContainer();
  canvasContainer.insertBefore(this._container, canvasContainer.firstChild);
};

ToggleMode.prototype.toggleMode = function(active = !this._active) {
  if (active === this._active) {
    return;
  }

  if (active) {
    this._container.innerHTML = `Token Simulation <span class="bts-toggle">${ ToggleOnIcon() }</span>`;

    domClasses(this._canvasParent).add('simulation');
  } else {
    this._container.innerHTML = `Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>`;

    domClasses(this._canvasParent).remove('simulation');
  }

  this._eventBus.fire(TOGGLE_MODE_EVENT, {
    active
  });

  this._active = active;
};

ToggleMode.$inject = [ 'eventBus', 'canvas' ];
