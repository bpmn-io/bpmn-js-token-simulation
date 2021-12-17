import TokenCount from './TokenCount';

import ScopeFilterModule from '../scope-filter';
import SimlationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ScopeFilterModule,
    SimlationStylesModule
  ],
  __init__: [
    'tokenCount'
  ],
  tokenCount: [ 'type', TokenCount ]
};