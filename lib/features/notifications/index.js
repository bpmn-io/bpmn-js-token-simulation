import ScopeFilterModule from '../scope-filter';

import Notifications from './Notifications';

export default {
  __depends__: [
    ScopeFilterModule
  ],
  notifications: [ 'type', Notifications ]
};