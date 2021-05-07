import AnimatedBehaviorsModule from './behaviors';

import Animation from './Animation';

export default {
  __depends__: [
    AnimatedBehaviorsModule
  ],
  animation: [ 'type', Animation ]
};