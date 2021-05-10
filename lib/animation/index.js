import AnimatedBehaviorsModule from './behaviors';
import ScopeFilterModule from '../features/scope-filter';

import Animation from './Animation';

export default {
  __depends__: [
    AnimatedBehaviorsModule,
    ScopeFilterModule
  ],
  animation: [ 'type', Animation ]
};