import AnimatedBehaviorsModule from './behaviors';
import ScopeFilterModule from '../features/scope-filter';
import SimulatorModule from '../simulator';

import Animation from './Animation';

export default {
  __depends__: [
    SimulatorModule,
    AnimatedBehaviorsModule,
    ScopeFilterModule
  ],
  animation: [ 'type', Animation ]
};