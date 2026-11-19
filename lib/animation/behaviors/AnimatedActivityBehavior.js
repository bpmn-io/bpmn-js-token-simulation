import ActivityBehavior from '../../simulator/behaviors/ActivityBehavior';

import {
  enterAfterCompensationAnimation
} from './CompensationAnimation';

import inherits from 'inherits-browser';


export default function AnimatedActivityBehavior(injector, animation) {
  injector.invoke(ActivityBehavior, this);

  this._animation = animation;
}

inherits(AnimatedActivityBehavior, ActivityBehavior);

AnimatedActivityBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedActivityBehavior.prototype.enter = function(context) {
  enterAfterCompensationAnimation(this._animation, context, () => {
    ActivityBehavior.prototype.enter.call(this, context);
  });
};
