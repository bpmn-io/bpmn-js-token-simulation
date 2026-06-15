import SimulationTrace from './SimulationTrace';
import SimulationSupport from './SimulationSupport';
import TraceEvents from './TraceEvents';


export default {
  __init__: [ 'traceEvents' ],
  traceEvents: [ 'type', TraceEvents ],
  simulationTrace: [ 'type', SimulationTrace ],
  simulationSupport: [ 'type', SimulationSupport ]
};
