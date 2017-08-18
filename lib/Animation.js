'use strict';

var SVG = require('svg.js');

var domQuery = require('min-dom/lib/query');

var geometryUtil = require('./util/GeometryUtil'),
    distance = geometryUtil.distance,
    toGfxMid = geometryUtil.toGfxMid;

var DELAY = 0;
var SPEED = 1;

var EASE_LINEAR = '-',
    EASE_IN = '<',
    EASE_OUT = '>',
    EASE_IN_OUT = '<>';

var TOKEN_SIZE = 20;

function Animation(canvas, eventBus, tokenGraphics) {
  var self = this;

  this._tokenGraphics = tokenGraphics;

  eventBus.on('import.done', function() {
    var draw = SVG(canvas._svg);

    var viewport = domQuery('.viewport', canvas._svg);

    var groupParent = SVG.adopt(viewport);

    self.group = draw
      .group()
      .attr('id', 'token-simulation');

    groupParent.put(self.group);
  });
}

Animation.prototype.createAnimation = function(connection, after) {
  var tokenGfx = this._createToken(connection);

  if (!after) {
    after = function() {}
  }

  return new _Animation({
    gfx: tokenGfx,
    waypoints: connection.waypoints,
    after: after
  });
};

Animation.prototype._createToken = function(connection) {
  var position = connection.waypoints[0];

  var tokenGfx = this._tokenGraphics.getToken(this.group, TOKEN_SIZE);
  
  tokenGfx
    .move(position.x, position.y)
    .hide();

  return tokenGfx;
}

Animation.$inject = [ 'canvas', 'eventBus', 'tokenGraphics' ];

module.exports = Animation;

// new instance of this will be returned
function _Animation (config) {
  var self = this;

  var gfx = this.gfx = config.gfx,
      waypoints = config.waypoints,
      after = config.after;

  this.animations = [];
  this.actualAnimation = undefined;

  function hasNext(index) {
    return index < self.animations.length - 1;
  }

  function getNext(index) {
    return self.animations[index + 1];
  }

  function isFirst(index) {
    return index === 1;
  }

  waypoints.forEach(function(waypoint, index) {
    if (index === 0) {
      var animation = function() {
        var point = toGfxMid(gfx, waypoint);

        gfx.move(point.x, point.y);

        // animation only if at least two waypoints
        if (hasNext(index)) {
          getNext(index)();
        }
      }

      self.animations.push(animation);
    } else {
      var animation = function() {
        var point = toGfxMid(gfx, waypoint);

        var duration = distance(waypoints[index - 1], waypoint) * 10 / SPEED;

        if (hasNext(index)) {
          var ease = isFirst(index) ? EASE_IN : EASE_LINEAR;

          if (waypoints.length == 2) {
            ease = EASE_IN_OUT;
          }

          self.actualAnimation = gfx
            .animate(duration, ease, DELAY) // should be configurable
            .move(point.x, point.y)
            .after(function() {
              getNext(index)(); // call next
            });
        } else {

          self.actualAnimation = gfx
            .animate(duration, EASE_OUT, DELAY) // should be configurable
            .move(point.x, point.y)
            .after(function() {
              after();

              gfx.remove();
            });
        }
      }

      self.animations.push(animation);
    }
  });
}

_Animation.prototype.start = function(index) {
  if (!index) {
    index = 0;
  }

  this.gfx.show();

  this.animations[index]();
};

_Animation.prototype.pause = function() {
  this.actualAnimation.pause();
}

_Animation.prototype.play = function() {
  this.actualAnimation.play();
}

_Animation.prototype.cancel = function() {
  this.actualAnimation.stop();

  this.gfx.remove();
}