import ResetSimulation from './ResetSimulation';

import NotificationsModule from '../notifications';

export default {
  __depends__: [
    NotificationsModule
  ],
  __init__: [
    'resetSimulation'
  ],
  resetSimulation: [ 'type', ResetSimulation ]
};