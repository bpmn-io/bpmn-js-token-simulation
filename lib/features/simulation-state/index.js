import SimulationState from './SimulationState';

import ElementNotificationsModule from '../element-notifications';
import NotificationsModule from '../notifications';

export default {
  __depends__: [
    ElementNotificationsModule,
    NotificationsModule
  ],
  __init__: [
    'simulationState'
  ],
  simulationState: [ 'type', SimulationState ]
};