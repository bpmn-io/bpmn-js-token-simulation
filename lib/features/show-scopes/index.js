import ShowScopes from './ShowScopes';

import ScopeFilterModule from '../scope-filter';

export default {
  __depends__: [
    ScopeFilterModule
  ],
  __init__: [
    'showScopes'
  ],
  showScopes: [ 'type', ShowScopes ]
};