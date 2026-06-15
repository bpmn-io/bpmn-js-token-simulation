import SimulationTrace from './SimulationTrace';
import SimulationSupport from './SimulationSupport';
import SimulationTraceEvents from './SimulationTraceEvents';


export default {
  __init__: [ 'simulationTraceEvents' ],
  simulationTraceEvents: [ 'type', SimulationTraceEvents ],
  simulationTrace: [ 'type', SimulationTrace ],
  simulationSupport: [ 'type', SimulationSupport ]
};
