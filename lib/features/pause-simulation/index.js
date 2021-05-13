import PauseSimulation from './PauseSimulation';

import NotificationsModule from '../notifications';

export default {
  __depends__: [
    NotificationsModule
  ],
  __init__: [
    'pauseSimulation'
  ],
  pauseSimulation: [ 'type', PauseSimulation ]
};