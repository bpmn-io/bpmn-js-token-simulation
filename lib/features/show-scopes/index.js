import ShowScopes from './ShowScopes';

import ScopeFilterModule from '../scope-filter';
import SimulationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ScopeFilterModule,
    SimulationStylesModule
  ],
  __init__: [
    'showScopes'
  ],
  showScopes: [ 'type', ShowScopes ]
};