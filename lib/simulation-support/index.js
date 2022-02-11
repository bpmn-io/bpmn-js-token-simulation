import SimulationTrace from './SimulationTrace';
import SimulationSupport from './SimulationSupport';

import {
  TRACE_EVENT
} from '../util/EventHelper';

import {
  ENTER_EVENT,
  EXIT_EVENT
} from './SimulationSupport';


export default {
  __init__: [ 'eventBus', function(eventBus) {
    eventBus.on(TRACE_EVENT, function(event) {

      if (event.action === 'enter') {
        eventBus.fire(ENTER_EVENT, event);
      }

      if (event.action === 'exit') {
        eventBus.fire(EXIT_EVENT, event);
      }
    });
  } ],
  simulationTrace: [ 'type', SimulationTrace ],
  simulationSupport: [ 'type', SimulationSupport ]
};
