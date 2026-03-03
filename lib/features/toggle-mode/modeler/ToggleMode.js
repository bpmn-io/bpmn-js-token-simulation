import {
  domify,
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT
} from '../../../util/EventHelper';

import {
  ToggleOffIcon,
  ToggleOnIcon
} from '../../../icons';


export default function ToggleMode(
    eventBus, canvas, selection,
    contextPad) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._selection = selection;
  this._contextPad = contextPad;

  this._active = false;

  eventBus.on('import.parse.start', () => {

    if (this._active) {
      this.toggleMode(false);

      eventBus.once('import.done', () => {
        this.toggleMode(true);
      });
    }
  });

  eventBus.on('diagram.init', () => {
    this._canvasParent = this._canvas.getContainer().parentNode;
    this._palette = domQuery('.djs-palette', this._canvas.getContainer());

    this._init();
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
    domClasses(this._palette).add('hidden');
  } else {
    this._container.innerHTML = `Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>`;

    domClasses(this._canvasParent).remove('simulation');
    domClasses(this._palette).remove('hidden');

    const elements = this._selection.get();

    if (elements.length === 1) {
      this._contextPad.open(elements[0]);
    }
  }

  this._eventBus.fire(TOGGLE_MODE_EVENT, {
    active
  });

  this._active = active;
};

ToggleMode.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'contextPad'
];