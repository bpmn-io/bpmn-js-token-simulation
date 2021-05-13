import Log from './Log';

import NotificationsModule from '../notifications';

export default {
  __depends__: [
    NotificationsModule
  ],
  __init__: [
    'log'
  ],
  log: [ 'type', Log ]
};