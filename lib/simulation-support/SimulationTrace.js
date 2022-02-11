import * as AllEvents from '../util/EventHelper';

import {
  assign,
  forEach
} from 'min-dash';

const VERY_HIGH_PRIORITY = 100000;


/**
 * A utility that traces everything that is happening
 * on the diagram. Tracing can be started, stopped and cleared.
 *
 * @param {EventBus} eventBus
 */
export default function SimulationTrace(eventBus) {
  this._eventBus = eventBus;

  this._events = [];

  this._log = this._log.bind(this);
}

SimulationTrace.$inject = [ 'eventBus' ];

SimulationTrace.prototype._log = function(event) {
  this._events.push(assign({}, event));
};

SimulationTrace.prototype.start = function() {
  forEach(AllEvents, event => {
    this._eventBus.on(event, VERY_HIGH_PRIORITY, this._log);
  });
};

SimulationTrace.prototype.stop = function() {
  forEach(AllEvents, event => {
    this._eventBus.off(event, this._log);
  });
};

SimulationTrace.prototype.getAll = function() {
  return this._events;
};