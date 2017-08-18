'use strict';

var domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event');

function TokenGraphics() {
}

// could return different tokens in the future
TokenGraphics.prototype.getToken = function(group, size) {
  return group
    .circle(size, size)
    .attr('class', 'token');
};

TokenGraphics.$inject = [];

module.exports = TokenGraphics;

