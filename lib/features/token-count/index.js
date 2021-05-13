import TokenCount from './TokenCount';

import ScopeFilterModule from '../scope-filter';

export default {
  __depends__: [
    ScopeFilterModule
  ],
  __init__: [
    'tokenCount'
  ],
  tokenCount: [ 'type', TokenCount ]
};