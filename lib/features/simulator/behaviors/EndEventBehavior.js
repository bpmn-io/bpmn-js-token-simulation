import {
  some
} from 'min-dash';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';


export default function EndEventBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:EndEvent', this);
}

EndEventBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  for (const outgoing of element.outgoing) {
    if (is(outgoing, 'bpmn:MessageFlow')) {
      this._simulator.signal({
        element: outgoing
      });
    }
  }

  this._simulator.exit(context);
};

EndEventBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

  const completes = scope.getTokens() === 1 || isTerminate(element);

  if (!completes) {
    return;
  }

  this._simulator.destroyScope(scope);

  const parentScope = scope.parent;

  if (parentScope) {
    this._simulator.exit({
      element: scope.element,
      scope: parentScope
    });
  }
};

EndEventBehavior.$inject = [ 'simulator' ];


function isTerminate(element) {
  return some(getBusinessObject(element).eventDefinitions, function(definition) {
    return is(definition, 'bpmn:TerminateEventDefinition');
  });
}