import ShowScopes from './ShowScopes';

import ScopeFilterModule from '../scope-filter';
import SimlationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ScopeFilterModule,
    SimlationStylesModule
  ],
  __init__: [
    'showScopes'
  ],
  showScopes: [ 'type', ShowScopes ]
};