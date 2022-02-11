import {
  query as domQuery
} from 'min-dom';

import {
  SCOPE_DESTROYED_EVENT
} from '../util/EventHelper';

import { is } from '../util/ElementHelper';

export const ENTER_EVENT = 'trace.elementEnter';
export const EXIT_EVENT = 'trace.elementExit';


/**
 * A utility to verify what is simulated, await simulation states
 * and trigger actions.
 *
 * @param {BpmnJS} bpmnJS
 * @param {ToggleMode} toggleMode
 */
export default function SimulationSupport(bpmnjs, toggleMode) {

  this._bpmnjs = bpmnjs;

  this._toggleMode = toggleMode;
}

SimulationSupport.$inject = [
  'bpmnjs',
  'toggleMode'
];

SimulationSupport.prototype.toggleSimulation = function(active) {

  // TODO(nikku): remove this hack
  if (typeof active === 'undefined') {
    active = !this._toggleMode._active;
  }

  this._toggleMode.toggleMode(active);
};

SimulationSupport.prototype.getElementTrigger = function(id) {
  return this._bpmnjs.invoke([ 'bpmnjs', function(bpmnjs) {
    return domQuery(
      `.djs-overlays[data-container-id='${id}'] .bts-context-pad:not(.hidden)`,
      bpmnjs._container
    );
  } ]);
};

SimulationSupport.prototype.getScopeTrigger = function(scope) {
  return this._bpmnjs.invoke([ 'bpmnjs', function(bpmnjs) {
    return domQuery(
      `.bts-scopes [data-scope-id='${scope.id}']`,
      bpmnjs._container
    );
  } ]);
};

SimulationSupport.prototype.triggerElement = function(id) {
  const domElement = this.getElementTrigger(id);

  if (!domElement) {
    throw new Error(`no element trigger for <${id}>`);
  }

  this._triggerClick(domElement);
};


SimulationSupport.prototype.triggerScope = function(scope) {
  const domElement = this.getScopeTrigger(scope);

  this._triggerClick(domElement);
};

SimulationSupport.prototype.scopeDestroyed = function(scope = null) {

  return new Promise(resolve => {

    return this._bpmnjs.invoke([ 'eventBus', function(eventBus) {

      const listener = function(event) {

        if (scope && event.scope !== scope) {
          return;
        }

        const scopeElements = [
          'bpmn:Participant',
          'bpmn:Process',
          'bpmn:SubProcess'
        ];

        if (scopeElements.every(t => !is(event.scope.element, t))) {
          return;
        }

        eventBus.off(SCOPE_DESTROYED_EVENT, listener);

        return resolve(event);
      };

      eventBus.on(SCOPE_DESTROYED_EVENT, listener);
    } ]);
  });
};

SimulationSupport.prototype.elementEnter = function(id = null) {

  return new Promise(resolve => {

    return this._bpmnjs.invoke([ 'eventBus', function(eventBus) {

      const wrap = id ? (fn) => ifElement(id, fn) : fn => fn;

      const listener = wrap(function(event) {
        eventBus.off(ENTER_EVENT, listener);

        return resolve(event);
      });

      eventBus.on(ENTER_EVENT, listener);
    } ]);
  });
};


SimulationSupport.prototype.elementExit = function(id = null) {

  return new Promise(resolve => {

    return this._bpmnjs.invoke([ 'eventBus', function(eventBus) {

      const wrap = id ? (fn) => ifElement(id, fn) : fn => fn;

      const listener = wrap(function(event) {
        eventBus.off(EXIT_EVENT, listener);

        return resolve(event);
      });

      eventBus.on(EXIT_EVENT, listener);
    } ]);
  });
};

SimulationSupport.prototype.getHistory = function(history) {

  return this._bpmnjs.invoke([ 'simulationTrace', function(simulationTrace) {
    return simulationTrace.getAll()
      .filter(function(event) {
        return (
          (event.action === 'exit' && (
            is(event.element, 'bpmn:StartEvent') ||
            is(event.element, 'bpmn:BoundaryEvent')
          )) ||
          (event.action === 'enter')
        );
      })
      .map(function(event) {
        return event.element.id;
      });
  } ]);
};


SimulationSupport.prototype._triggerClick = function(element, options = {}) {

  const defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  };

  options = Object.assign({}, defaultOptions, options);

  const event = document.createEvent('MouseEvents');

  event.initMouseEvent(
    'click',
    options.bubbles,
    options.cancelable,
    document.defaultView,
    options.button,
    options.pointerX,
    options.pointerY,
    options.pointerX,
    options.pointerY,
    options.ctrlKey,
    options.altKey,
    options.shiftKey,
    options.metaKey,
    options.button,
    element
  );

  element.dispatchEvent(event);
};


// helpers ///////////////////

function ifElement(id, fn) {
  return function(event) {
    var element = event.element;

    if (element.id === id) {
      fn(event);
    }
  };
}
