import { getBusinessObject } from '../../../util/ElementHelper';

export default function BoundaryEventBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:BoundaryEvent', this);
}

BoundaryEventBehavior.prototype.signal = function(context) {

  const {
    element,
    scope
  } = context;

  const scopeElement = element.host;

  const cancelActivity = getBusinessObject(element).cancelActivity;

  if (cancelActivity) {

    const childScope = this._simulator.findScope({
      parent: scope,
      element: scopeElement
    });

    if (!childScope) {
      throw new Error('cancel scope not found');
    }

    this._simulator.destroyScope(childScope);

    // remove destroyed scope token
    scope.updateTokens(scopeElement, -1);
  }

  this._simulator.exit(context);
};

BoundaryEventBehavior.prototype.enter = function(context) {};

BoundaryEventBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

  // TODO(nikku): move split behavior into shared place
  for (const outgoing of element.outgoing) {
    this._simulator.enter({
      element: outgoing,
      scope
    });
  }

  // TODO: create hook for UI elements to show context menus
};

BoundaryEventBehavior.$inject = [ 'simulator' ];