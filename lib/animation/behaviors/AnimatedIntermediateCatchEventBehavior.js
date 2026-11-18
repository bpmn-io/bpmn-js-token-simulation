import IntermediateCatchEventBehavior from '../../simulator/behaviors/IntermediateCatchEventBehavior';

import {
  enterAfterCompensationAnimation
} from './CompensationAnimation';

import inherits from 'inherits-browser';


export default function AnimatedIntermediateCatchEventBehavior(injector, animation) {
  injector.invoke(IntermediateCatchEventBehavior, this);

  this._animation = animation;
}

inherits(AnimatedIntermediateCatchEventBehavior, IntermediateCatchEventBehavior);

AnimatedIntermediateCatchEventBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedIntermediateCatchEventBehavior.prototype.enter = function(context) {
  enterAfterCompensationAnimation(this._animation, context, () => {
    IntermediateCatchEventBehavior.prototype.enter.call(this, context);
  });
};
