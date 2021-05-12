import {
  domify,
  classes as domClasses,
  delegate as domDelegate,
  queryAll as domQueryAll
} from 'min-dom';

import {
  TOGGLE_MODE_EVENT,
  ANIMATION_SPEED_CHANGED_EVENT
} from '../../util/EventHelper';

const SPEEDS = [
  [ 'Slow', 0.5 ],
  [ 'Normal', 1 ],
  [ 'Fast', 2 ]
];

export default function SetAnimationSpeed(canvas, animation, eventBus) {
  this._canvas = canvas;
  this._animation = animation;
  this._eventBus = eventBus;

  this._init(animation.getAnimationSpeed());

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    const active = event.active;

    if (!active) {
      domClasses(this._container).add('hidden');
    } else {
      domClasses(this._container).remove('hidden');
    }
  });

  eventBus.on(ANIMATION_SPEED_CHANGED_EVENT, event => {
    this.setActive(event.speed);
  });
}

SetAnimationSpeed.prototype.getToggleSpeed = function(element) {
  return parseFloat(element.dataset.speed);
};

SetAnimationSpeed.prototype._init = function(animationSpeed) {
  this._container = domify(`
    <div class="set-animation-speed hidden">
      <i title="Set Animation Speed" class="fa fa-tachometer" aria-hidden="true"></i>
      <div class="animation-speed-buttons">
        ${
          SPEEDS.map(([ label, speed ], idx) => `
            <div title="${ label }" data-speed="${ speed }" class="animation-speed-button ${speed === animationSpeed ? 'active' : ''}">
              ${
                Array.from({ length: idx + 1 }).map(
                  () => '<i class="fa fa-angle-right" aria-hidden="true"></i>'
                ).join('')
              }
            </div>
          `).join('')
        }
      </div>
    </div>
  `);

  domDelegate.bind(this._container, '[data-speed]', 'click', event => {

    const toggle = event.delegateTarget;

    const speed = this.getToggleSpeed(toggle);

    this._animation.setAnimationSpeed(speed);
  });

  this._canvas.getContainer().appendChild(this._container);
};

SetAnimationSpeed.prototype.setActive = function(speed) {
  domQueryAll('[data-speed]', this._container).forEach(toggle => {

    const active = this.getToggleSpeed(toggle) === speed;

    domClasses(toggle)[active ? 'add' : 'remove']('active');
  });
};

SetAnimationSpeed.$inject = [
  'canvas',
  'animation',
  'eventBus'
];
