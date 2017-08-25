'use strict';

var SVG = require('svg.js');

var domQuery = require('min-dom/lib/query');

var geometryUtil = require('../util/GeometryUtil'),
    distance = geometryUtil.distance;

function isFirstSegment(index) {
  return index === 1;
}

function isSingleSegment(waypoints) {
  return waypoints.length == 2;
}

var DELAY = 0;
var SPEED = 1;

var EASE_LINEAR = '-',
    EASE_IN = '<',
    EASE_OUT = '>',
    EASE_IN_OUT = '<>';

var TOKEN_SIZE = 20;

function Animation(canvas, eventBus) {
  var self = this;

  this.animations = [];

  eventBus.on('import.done', function() {
    var draw = SVG(canvas._svg);

    var viewport = domQuery('.viewport', canvas._svg);

    var groupParent = SVG.adopt(viewport);

    self.group = draw
      .group()
      .attr('id', 'token-simulation');

    groupParent.put(self.group);
  });

  eventBus.on('tokenSimulation.resetSimulation', function() {
    self.animations.forEach(function(animation) {
      animation.stop();
    });

    self.animations = [];
  });

  eventBus.on('tokenSimulation.pauseSimulation', function() {
    self.animations.forEach(function(animation) {
      animation.pause();
    });
  });

  eventBus.on('tokenSimulation.playSimulation', function() {
    self.animations.forEach(function(animation) {
      animation.play();
    });
  });
}

Animation.prototype.createAnimation = function(connection, done) {
  var self = this;
  
  if (!this.group) {
    return;
  }

  var tokenGfx = this._createTokenGfx(connection);

  var animation;

  animation = new _Animation(tokenGfx, connection.waypoints, function() {
    self.animations = self.animations.filter(function(a) {
      return a !== animation;
    });

    if (done) {
      done();
    }
  });

  this.animations.push(animation);

  return animation;
};

Animation.prototype._createTokenGfx = function() {
  return this.group
    .circle(TOKEN_SIZE, TOKEN_SIZE)
    .attr('class', 'token')
    .hide();
}

Animation.$inject = [ 'canvas', 'eventBus' ];

module.exports = Animation;

function _Animation(gfx, waypoints, done) {
  this.gfx = this.fx = gfx;
  this.waypoints = waypoints;
  this.done = done;

  this.create();
}

_Animation.prototype.create = function() {
  var gfx = this.gfx,
      waypoints = this.waypoints,
      done = this.done,
      fx = this.fx;
  
  gfx
    .show()
    .move(waypoints[0].x - TOKEN_SIZE / 2, waypoints[0].y - TOKEN_SIZE / 2);

  waypoints.forEach(function(waypoint, index) {
    if (index > 0) {
      var x = waypoint.x - TOKEN_SIZE / 2,
          y = waypoint.y - TOKEN_SIZE / 2;

      var ease = isFirstSegment(index) ? EASE_IN : EASE_LINEAR;

      if (isSingleSegment(waypoints)) {
        ease = EASE_IN_OUT;
      }

      var duration = distance(waypoints[index - 1], waypoint) * 10 / SPEED;

      fx = fx
        .animate(duration, ease, DELAY)
        .move(x, y);
    }
  });

  fx.after(function() {
    gfx.remove();

    done();
  });
};

_Animation.prototype.play = function() {
  this.gfx.play();
};

_Animation.prototype.pause = function() {
  this.gfx.pause();
};

_Animation.prototype.stop = function() {
  this.fx.stop();
  this.gfx.remove();
};