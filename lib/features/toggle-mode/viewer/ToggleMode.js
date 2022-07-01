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

import { PLUGIN_ID } from '../../plugin/Plugin';


export default function ToggleMode(eventBus, canvas, pluginManager) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._pluginManager = pluginManager;

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

    this._init();
  });

  eventBus.on(TOGGLE_MODE_EVENT, ({ active }) => {
    this._update(active);
  });
}

ToggleMode.prototype._init = function() {
  this._container = domify(`
    <div class="bts-toggle-mode">
      Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>
    </div>
  `);

  domEvent.bind(this._container, 'click', () => this._toggle());

  this._canvas.getContainer().appendChild(this._container);
};

ToggleMode.prototype._update = function(active) {
  if (active) {
    this._container.innerHTML = `Token Simulation <span class="bts-toggle">${ ToggleOnIcon() }</span>`;

    domClasses(this._canvasParent).add('simulation');
  } else {
    this._container.innerHTML = `Token Simulation <span class="bts-toggle">${ ToggleOffIcon() }</span>`;

    domClasses(this._canvasParent).remove('simulation');
  }
};

ToggleMode.prototype._toggle = function() {
  if (this._pluginManager.getActivePlugin() === PLUGIN_ID) {
    this._pluginManager.deactivatePlugin(PLUGIN_ID);
  } else {
    this._pluginManager.activatePlugin(PLUGIN_ID);
  }
};

ToggleMode.$inject = [ 'eventBus', 'canvas', 'pluginManager' ];