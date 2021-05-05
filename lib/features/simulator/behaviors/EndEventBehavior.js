import {
  some
} from 'min-dash';

import {
  is
} from '../../../util/ElementHelper';


export default function EndEventBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:EndEvent', this);
}

EndEventBehavior.prototype.enter = function(context) {

  const {
    element,
    scope
  } = context;

  // scope completes, as this is the last existing token
  const terminates = isTerminate(element);

  if (scope.tokens === 1 || terminates) {
    this._simulator.destroyScope(scope);
  }

  const parentScope = scope.parent;

  if (parentScope) {
    this._simulator.exit({
      element: parentScope.element,
      scope: parentScope
    });
  }
};

EndEventBehavior.prototype.exit = function(context) {

  // not implemented
};

EndEventBehavior.$inject = [ 'simulator' ];


function isTerminate(element) {
  return some(element.businessObject.eventDefinitions, function(definition) {
    return definition.$type === 'bpmn:TerminateEventDefinition';
  });
}