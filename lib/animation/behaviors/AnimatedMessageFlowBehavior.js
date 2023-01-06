import MessageFlowBehavior from '../../simulator/behaviors/MessageFlowBehavior';

import inherits from 'inherits-browser';


export default function AnimatedMessageFlowBehavior(injector, animation) {
  injector.invoke(MessageFlowBehavior, this);

  this._animation = animation;
}

inherits(AnimatedMessageFlowBehavior, MessageFlowBehavior);

AnimatedMessageFlowBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedMessageFlowBehavior.prototype.signal = function(context) {

  const {
    element,
    scope
  } = context;

  this._animation.animate(element, scope, () => {
    MessageFlowBehavior.prototype.signal.call(this, context);
  });
};
