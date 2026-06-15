import {
  TRACE_EVENT
} from '../util/EventHelper';

import {
  ENTER_EVENT,
  EXIT_EVENT
} from './SimulationSupport';


/**
 * Emits dedicated element enter and exit events based on the
 * simulation trace.
 *
 * @param {EventBus} eventBus
 */
export default function TraceEvents(eventBus) {
  eventBus.on(TRACE_EVENT, function(event) {

    if (event.action === 'enter') {
      eventBus.fire(ENTER_EVENT, event);
    }

    if (event.action === 'exit') {
      eventBus.fire(EXIT_EVENT, event);
    }
  });
}

TraceEvents.$inject = [ 'eventBus' ];
