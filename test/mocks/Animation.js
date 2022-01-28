function noop() {}

function Animation() {
  this.animations = [];
  this.hiddenAnimations = [];

  this.createAnimation = function(connection, processInstanceId, done) {
    setTimeout(done);
  };

  this.setAnimationSpeed = noop;
  this.showProcessInstanceAnimations = noop;
  this.hideProcessInstanceAnimations = noop;
}

export default {
  __init__: [ 'animation' ],
  animation: [ 'type', Animation ]
};