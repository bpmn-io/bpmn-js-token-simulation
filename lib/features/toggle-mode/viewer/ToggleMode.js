import {
  domify,
  classes as domClasses,
  event as domEvent
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT
} from '../../../util/EventHelper';


export default function ToggleMode(eventBus, canvas, selection) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this.simulationModeActive = false;

  eventBus.on('import.done', () => {
    this._canvasParent = this._canvas.getContainer().parentNode;

    this._init();
  });
}

ToggleMode.prototype._init = function() {
  this._container = domify(`
    <div class="toggle-mode">
      Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>
    </div>
  `);

  domEvent.bind(this._container, 'click', this.toggleMode.bind(this));

  this._canvas.getContainer().appendChild(this._container);
};

ToggleMode.prototype.toggleMode = function() {
  if (this.simulationModeActive) {
    this._container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>';

    domClasses(this._canvasParent).remove('simulation');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: false
    });
  } else {
    this._container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-on"></i></span>';

    domClasses(this._canvasParent).add('simulation');

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      simulationModeActive: true
    });
  }

  this.simulationModeActive = !this.simulationModeActive;
};

ToggleMode.$inject = [ 'eventBus', 'canvas' ];