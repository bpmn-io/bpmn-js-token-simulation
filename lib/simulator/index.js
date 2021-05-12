import Simulator from './Simulator';
import SimulationBehaviorModule from './behaviors';

export default {
  __depends__: [
    SimulationBehaviorModule
  ],
  __init__: [
    [ 'eventBus', 'simulator', function(eventBus, simulator) {
      eventBus.on('tokenSimulation.toggleMode', event => {
        if (!event.active) {
          simulator.reset();
        }
      });

      eventBus.on('tokenSimulation.resetSimulation', event => {
        simulator.reset();
      });
    } ]
  ],
  simulator: [ 'type', Simulator ]
};