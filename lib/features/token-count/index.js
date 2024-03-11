import TokenCount from './TokenCount';

import ScopeFilterModule from '../scope-filter';
import SimulationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ScopeFilterModule,
    SimulationStylesModule
  ],
  __init__: [
    'tokenCount'
  ],
  tokenCount: [ 'type', TokenCount ]
};