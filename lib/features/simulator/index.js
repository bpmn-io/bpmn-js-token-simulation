import Simulator from './Simulator';
import SimulationBehaviorModule from './behaviors';

export default {
  __depends__: [
    SimulationBehaviorModule
  ],
  simulator: [ 'type', Simulator ]
};