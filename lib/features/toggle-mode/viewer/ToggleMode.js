import {
  domify,
  classes as domClasses,
  event as domEvent
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
    <div class="bts-toggle-mode">
      Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>
    </div>
  `);

  domEvent.bind(this._container, 'click', () => this.toggleMode());

  this._canvas.getContainer().appendChild(this._container);

  // Add blue frame overlay
  this._frameOverlay = domify(`
    <div class="bts-frame-overlay"></div>
  `);

  this._canvas.getContainer().appendChild(this._frameOverlay);

  // Add close button for simulation mode
  this._closeButton = domify(`
    <div class="bts-close-button">
      Exit
      <svg id="icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32">
        <polygon fill="white" points="17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16"/>
      </svg>
    </div>
  `);

  domEvent.bind(this._closeButton, 'click', () => this.toggleMode(false));

  this._canvas.getContainer().appendChild(this._closeButton);
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
