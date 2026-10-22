import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT
} from '../../../util/EventHelper';

import {
  ToggleOffIcon,
  ToggleOnIcon
} from '../../../icons';


export default function ToggleMode(eventBus, canvas, translate) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._translate = translate;

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
    <div class="bts-toggle-mode">
      <span class="bts-label"></span> <span class="bts-toggle">${ ToggleOffIcon() }</span>
    </div>
  `);

  this._label = domQuery('.bts-label', this._container);
  this._toggle = domQuery('.bts-toggle', this._container);

  this._label.textContent = this._translate('Token Simulation');

  domEvent.bind(this._container, 'click', () => this.toggleMode());

  this._canvas.getContainer().appendChild(this._container);
};

ToggleMode.prototype._toggleIcon = function(active) {
  this._toggle.innerHTML = active ? ToggleOnIcon() : ToggleOffIcon();
};

ToggleMode.prototype.toggleMode = function(active = !this._active) {
  if (active === this._active) {
    return;
  }

  if (active) {
    domClasses(this._canvasParent).add('simulation');
  } else {
    domClasses(this._canvasParent).remove('simulation');
  }

  this._toggleIcon(active);

  this._eventBus.fire(TOGGLE_MODE_EVENT, {
    active
  });

  this._active = active;
};

ToggleMode.$inject = [ 'eventBus', 'canvas', 'translate' ];
