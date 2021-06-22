import {
  domify,
  classes as domClasses,
  event as domEvent,
  query as domQuery
} from 'min-dom';

import {
  TOGGLE_AUTOMATIC_MODE_EVENT
} from '../../util/EventHelper';


export default function ToggleAutomatic(eventBus, canvas) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this.automaticMode = true;
  this.disabled = true;

  this.palette = domQuery('.animation-palette', this._canvas.getContainer());
  if (!this.palette) {
    this.palette = domify('<div class="animation-palette"></div>');
    this._canvas.getContainer().appendChild(this.palette);
  }

  eventBus.on('import.done', () => {
    this.canvasParent = this._canvas.getContainer().parentNode;

    this._init();
  });

}

ToggleAutomatic.prototype._init = function() {
  this.container = domify(`
    <div class="toggle-automatic hidden">
      Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-on"></i></span>
    </div>
  `);

  domEvent.bind(this.container, 'click', () => this.toggleAutomatic());

  this.palette.appendChild(this.container);
};

ToggleAutomatic.prototype.toggleAutomatic = function() {
  if (!this.disabled) {
    if (this.automaticMode) {
      this.container.innerHTML = 'Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-off"></i></span>';

      this._eventBus.fire(TOGGLE_AUTOMATIC_MODE_EVENT, {
        automaticMode: false
      });

    } else {
      this.container.innerHTML = 'Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-on"></i></span>';

      this._eventBus.fire(TOGGLE_AUTOMATIC_MODE_EVENT, {
        automaticMode: true
      });
    }
    this.automaticMode = !this.automaticMode;
  }
};

ToggleAutomatic.prototype.disableToggle = function(disable) {
  this.disabled = disable;

  if (disable) {
    domClasses(this.container).add('hidden');
  } else {
    domClasses(this.container).remove('hidden');
  }

};

ToggleAutomatic.$inject = [ 'eventBus', 'canvas' ];