import ContextPads from './ContextPads';

import ScopeFilterModule from '../scope-filter';

export default {
  __depends__: [
    ScopeFilterModule
  ],
  __init__: [
    'contextPads'
  ],
  contextPads: [ 'type', ContextPads ]
};