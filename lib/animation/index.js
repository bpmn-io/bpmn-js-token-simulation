import AnimatedBehaviorsModule from './behaviors';
import ScopeFilterModule from '../features/scope-filter';
import SimulationStylesModule from '../features/simulation-styles';
import SimulatorModule from '../simulator';

import Animation from './Animation';

export default {
  __depends__: [
    SimulatorModule,
    AnimatedBehaviorsModule,
    ScopeFilterModule,
    SimulationStylesModule
  ],
  animation: [ 'type', Animation ]
};
