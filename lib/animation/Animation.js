import {
  query as domQuery
} from 'min-dom';

import {
  appendTo as svgAppendTo,
  create as svgCreate,
  attr as svgAttr,
  remove as svgRemove
} from 'tiny-svg';

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

const EASE_LINEAR = function(pos) {
  return pos;
};
const EASE_IN = function(pos) {
  return -Math.cos(pos * Math.PI / 2) + 1;
};
const EASE_OUT = function(pos) {
  return Math.sin(pos * Math.PI / 2);
};
const EASE_IN_OUT = function(pos) {
  return -Math.cos(pos * Math.PI) / 2 + 0.5;
};

const TOKEN_SIZE = 20;


export default function Animation(canvas, eventBus, scopeFilter) {
  this._eventBus = eventBus;
  this._scopeFilter = scopeFilter;
  this._canvas = canvas;

  this._animations = new Set();
  this._speed = 1;

  eventBus.on(RESET_SIMULATION_EVENT, () => {
    this.clearAnimations();
  });

  eventBus.on(PAUSE_SIMULATION_EVENT, () => {
    this.pause();
  });

  eventBus.on(PLAY_SIMULATION_EVENT, () => {
    this.play();
  });

  eventBus.on(SCOPE_FILTER_CHANGED_EVENT, event => {

    this.each(animation => {
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

Animation.prototype.pause = function() {
  this.each(animation => animation.pause());
};

Animation.prototype.play = function() {
  this.each(animation => animation.play());
};

Animation.prototype.each = function(fn) {
  this._animations.forEach(fn);
};

Animation.prototype.createAnimation = function(connection, scope, done = noop) {
  const group = this._getGroup(scope);

  if (!group) {
    return;
  }

  const tokenGfx = this._createTokenGfx(group, scope);

  const animation = new TokenAnimation(tokenGfx, connection.waypoints, () => {
    this._animations.delete(animation);

    done();
  });

  animation.setSpeed(this.getAnimationSpeed());

  if (!this._scopeFilter.isShown(scope)) {
    animation.hide();
  }

  animation.scope = scope;
  animation.element = connection;

  this._animations.add(animation);

  this._eventBus.fire(ANIMATION_CREATED_EVENT, {
    animation
  });

  animation.play();

  return animation;
};

Animation.prototype.setAnimationSpeed = function(speed) {
  this._speed = speed;

  this.each(animation => animation.setSpeed(speed));

  this._eventBus.fire(ANIMATION_SPEED_CHANGED_EVENT, {
    speed
  });
};

Animation.prototype.getAnimationSpeed = function() {
  return this._speed;
};

Animation.prototype.clearAnimations = function(scope) {
  this.each(animation => {
    if (!scope || animation.scope === scope) {
      animation.remove();
    }
  });
};

Animation.prototype._createTokenGfx = function(group, scope) {
  const parent = svgCreate(this._getTokenSVG(scope).trim());

  return svgAppendTo(parent, group);
};

Animation.prototype._getTokenSVG = function(scope) {

  const colors = scope.colors || {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  return `
    <g class="bts-token">
      <circle
        class="bts-circle"
        r="${TOKEN_SIZE / 2}"
        cx="${TOKEN_SIZE / 2}"
        cy="${TOKEN_SIZE / 2}"
        fill="${ colors.primary }"
      />
      <text
        class="bts-text"
        transform="translate(10, 14)"
        text-anchor="middle"
        fill="${ colors.auxiliary }"
      >1</text>
    </g>
  `;
};

Animation.prototype._getGroup = function(scope) {

  var canvas = this._canvas;

  var layer, root;

  // bpmn-js@9 compatibility:
  // show animation tokens on plane layers
  if ('findRoot' in canvas) {
    root = canvas.findRoot(scope.element);
    layer = canvas._findPlaneForRoot(root).layer;
  } else {
    layer = domQuery('.viewport', canvas._svg);
  }

  var group = domQuery('.bts-animation-tokens', layer);

  if (!group) {
    group = svgCreate('<g class="bts-animation-tokens" />');

    svgAppendTo(
      group,
      layer
    );
  }

  return group;
};

Animation.$inject = [
  'canvas',
  'eventBus',
  'scopeFilter'
];


function TokenAnimation(gfx, waypoints, done) {
  this.gfx = gfx;
  this.waypoints = waypoints;
  this.done = done;

  this._paused = true;
  this._t = 0;
  this._parts = [];

  this.create();
}

TokenAnimation.prototype.pause = function() {
  this._paused = true;
};

TokenAnimation.prototype.play = function() {

  if (this._paused) {
    this._paused = false;

    this.tick(0);
  }

  this.schedule();
};

TokenAnimation.prototype.schedule = function() {

  if (this._paused) {
    return;
  }

  if (this._scheduled) {
    return;
  }

  const last = Date.now();

  this._scheduled = true;

  requestAnimationFrame(() => {
    this._scheduled = false;

    if (this._paused) {
      return;
    }

    this.tick((Date.now() - last) * this._speed);
    this.schedule();
  });
};


TokenAnimation.prototype.tick = function(tElapsed) {

  const t = this._t = this._t + tElapsed;

  const part = this._parts.find(
    p => p.startTime <= t && p.endTime > t
  );

  // completed
  if (!part) {
    return this.remove();
  }

  const segmentTime = t - part.startTime;
  const segmentLength = part.length * part.easing(segmentTime / part.duration);

  const currentLength = part.startLength + segmentLength;

  const point = this._path.getPointAtLength(currentLength);

  this.move(point.x, point.y);
};

TokenAnimation.prototype.move = function(x, y) {
  svgAttr(this.gfx, 'transform', `translate(${x}, ${y})`);
};

TokenAnimation.prototype.create = function() {
  const waypoints = this.waypoints;

  const parts = waypoints.reduce((parts, point, index) => {

    const lastPoint = waypoints[index - 1];

    if (lastPoint) {
      const lastPart = parts[parts.length - 1];

      const startLength = lastPart && lastPart.endLength || 0;
      const length = distance(lastPoint, point);

      parts.push({
        startLength,
        endLength: startLength + length,
        length,
        easing: getSegmentEasing(index, waypoints)
      });
    }

    return parts;
  }, []);

  const totalLength = parts.reduce(function(length, part) {
    return length + part.length;
  }, 0);

  const d = waypoints.reduce((d, waypoint, index) => {

    const x = waypoint.x - TOKEN_SIZE / 2,
          y = waypoint.y - TOKEN_SIZE / 2;

    d.push([ index > 0 ? 'L' : 'M', x, y ]);

    return d;
  }, []).flat().join(' ');

  const totalDuration = getAnimationDuration(totalLength);

  this._parts = parts.reduce((parts, part, index) => {
    const duration = totalDuration / totalLength * part.length;
    const startTime = index > 0 ? parts[index - 1].endTime : 0;
    const endTime = startTime + duration;

    return [
      ...parts,
      {
        ...part,
        startTime,
        endTime,
        duration
      }
    ];
  }, []);

  this._path = svgCreate(`<path d="${d}" />`);
  this._t = 0;
};

TokenAnimation.prototype.show = function() {
  svgAttr(this.gfx, 'display', '');
};

TokenAnimation.prototype.hide = function() {
  svgAttr(this.gfx, 'display', 'none');
};

TokenAnimation.prototype.remove = function() {
  this.pause();

  svgRemove(this.gfx);

  this.done();
};

TokenAnimation.prototype.setSpeed = function(speed) {
  this._speed = speed;
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