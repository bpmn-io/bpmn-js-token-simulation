import SimulationState from './SimulationState';

import ElementNotificationsModule from '../element-notifications';

export default {
  __depends__: [
    ElementNotificationsModule
  ],
  __init__: [ 'simulationState' ],
  simulationState: [ 'type', SimulationState ]
};