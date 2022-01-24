import Simulator from './Simulator';
import SimulationBehaviorModule from './behaviors';

const HIGH_PRIORITY = 5000;

export default {
  __depends__: [
    SimulationBehaviorModule
  ],
  __init__: [
    [ 'eventBus', 'simulator', function(eventBus, simulator) {
      eventBus.on([
        'tokenSimulation.toggleMode',
        'tokenSimulation.resetSimulation'
      ], HIGH_PRIORITY, event => {
        simulator.reset();
      });
    } ]
  ],
  simulator: [ 'type', Simulator ]
};