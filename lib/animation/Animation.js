import SVG from 'svg.js';

import {
  query as domQuery
} from 'min-dom';

import {
  RESET_SIMULATION_EVENT,
  PLAY_SIMULATION_EVENT,
  PAUSE_SIMULATION_EVENT,
  ANIMATION_CREATED_EVENT,
  ANIMATION_SPEED_CHANGED_EVENT,
  SCOPE_DESTROYED_EVENT,
  SCOPE_FILTER_CHANGED_EVENT
} from '../util/EventHelper';

const STYLE = getComputedStyle(document.documentElement);

const DEFAULT_PRIMARY_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');
const DEFAULT_AUXILIARY_COLOR = STYLE.getPropertyValue('--token-simulation-white');

function noop() {}

function getSegmentEasing(index, waypoints) {

  // only a single segment
  if (waypoints.length === 2) {
    return EASE_IN_OUT;
  }

  // first segment
  if (index === 1) {
    return EASE_IN;
  }

  // last segment
  if (index === waypoints.length - 1) {
    return EASE_OUT;
  }

  return EASE_LINEAR;
}

const DELAY = 0;

const EASE_LINEAR = '-';
const EASE_IN = '<';
const EASE_OUT = '>';
const EASE_IN_OUT = '<>';

const TOKEN_SIZE = 20;


export default function Animation(canvas, eventBus, scopeFilter) {
  this._eventBus = eventBus;
  this._scopeFilter = scopeFilter;

  this._animations = new Set();
  this._animationSpeed = 1;

  eventBus.on('import.done', () => {
    const draw = SVG(canvas._svg);

    const viewport = domQuery('.viewport', canvas._svg);

    const groupParent = SVG.adopt(viewport);

    this.group = draw
      .group()
      .attr('id', 'token-simulation');

    groupParent.put(this.group);
  });

  eventBus.on(RESET_SIMULATION_EVENT, () => {
    this._animations.forEach(animation => {
      animation.remove();
    });

    this._animations.clear();
  });

  eventBus.on(PAUSE_SIMULATION_EVENT, () => {
    this._animations.forEach(animation => {
      animation.pause();
    });
  });

  eventBus.on(PLAY_SIMULATION_EVENT, () => {
    this._animations.forEach(animation => {
      animation.play();
    });
  });

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    this._animations.forEach(animation => {
      if (this._scopeFilter.isShown(animation.scope)) {
        animation.show();
      } else {
        animation.hide();
      }
    });
  });

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    this.clearAnimations(scope);
  });
}

Animation.prototype.animate = function(connection, scope, done) {
  this.createAnimation(connection, scope, done);
};

Animation.prototype.createAnimation = function(connection, scope, done=noop) {
  if (!this.group) {
    return;
  }

  const tokenGfx = this._createTokenGfx(scope);

  const animation = new TokenAnimation(tokenGfx, connection.waypoints, () => {
    this._animations.delete(animation);

    done();
  });

  if (!this._scopeFilter.isShown(scope)) {
    animation.hide();
  }

  animation.setSpeed(this._animationSpeed);
  animation.scope = scope;
  animation.element = connection;

  this._animations.add(animation);

  this._eventBus.fire(ANIMATION_CREATED_EVENT, {
    animation
  });

  return animation;
};

Animation.prototype.setAnimationSpeed = function(speed) {
  this._animations.forEach(animation => {
    animation.setSpeed(speed);
  });

  this._animationSpeed = speed;

  this._eventBus.fire(ANIMATION_SPEED_CHANGED_EVENT, {
    speed
  });
};

Animation.prototype.getAnimationSpeed = function() {
  return this._animationSpeed;
};

Animation.prototype.clearAnimations = function(scope) {
  this._animations.forEach(animation => {
    if (animation.scope === scope) {
      animation.remove();
    }
  });
};

Animation.prototype._createTokenGfx = function(scope) {

  const colors = scope.colors || {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  const parent = this.group
    .group()
    .attr('class', 'token')
    .hide();

  parent
    .circle(TOKEN_SIZE, TOKEN_SIZE)
    .attr('fill', colors.primary)
    .attr('class', 'circle');

  parent
    .text('1')
    .attr('transform', 'translate(10, -7)')
    .attr('text-anchor', 'middle')
    .attr('fill', colors.auxiliary)
    .attr('class', 'text');

  return parent;
};

Animation.$inject = [
  'canvas',
  'eventBus',
  'scopeFilter'
];


function TokenAnimation(gfx, waypoints, done) {
  this.gfx = this.fx = gfx;
  this.waypoints = waypoints;
  this.done = done;

  this.create();
}

TokenAnimation.prototype.create = function() {
  const gfx = this.gfx;
  const waypoints = this.waypoints;

  let fx = this.fx;

  gfx
    .show()
    .move(waypoints[0].x - TOKEN_SIZE / 2, waypoints[0].y - TOKEN_SIZE / 2);

  const totalLength = waypoints.reduce(function(length, waypoint, index) {

    const lastWaypoint = waypoints[index - 1];

    if (lastWaypoint) {

      length += distance(lastWaypoint, waypoint);
    }

    return length;
  }, 0);

  const totalDuration = getAnimationDuration(totalLength);

  waypoints.forEach(function(waypoint, index) {
    if (index > 0) {
      const x = waypoint.x - TOKEN_SIZE / 2,
            y = waypoint.y - TOKEN_SIZE / 2;

      const ease = getSegmentEasing(index, waypoints);

      const duration = (distance(waypoints[index - 1], waypoint) / totalLength) * totalDuration;

      fx = fx
        .animate(duration, ease, DELAY)
        .move(x, y);
    }
  });

  fx.after(() => {
    this.remove();
  });
};

TokenAnimation.prototype.show = function() {
  this.gfx.show();
};

TokenAnimation.prototype.hide = function() {
  this.gfx.hide();
};

TokenAnimation.prototype.play = function() {
  this.gfx.play();
};

TokenAnimation.prototype.pause = function() {
  this.gfx.pause();
};

TokenAnimation.prototype.remove = function() {
  this.fx.stop();
  this.gfx.remove();

  this.done();
};

TokenAnimation.prototype.setSpeed = function(speed) {
  this.gfx.fx._speed = speed;
};

function getAnimationDuration(length) {
  return Math.log(length) * randomBetween(250, 300);
}

function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}