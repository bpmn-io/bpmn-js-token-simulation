import SequenceFlowBehavior from '../../simulator/behaviors/SequenceFlowBehavior';

import inherits from 'inherits-browser';


export default function AnimatedSequenceFlowBehavior(injector, animation) {
  injector.invoke(SequenceFlowBehavior, this);

  this._animation = animation;
}

inherits(AnimatedSequenceFlowBehavior, SequenceFlowBehavior);

AnimatedSequenceFlowBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedSequenceFlowBehavior.prototype.enter = function(context) {

  const {
    element,
    scope
  } = context;

  this._animation.animate(element, scope, () => {
    SequenceFlowBehavior.prototype.enter.call(this, context);
  });
};