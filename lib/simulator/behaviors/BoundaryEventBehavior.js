import {
  getBusinessObject,
  is
} from './ModelUtil';


export default function BoundaryEventBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

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

    if (is(scopeElement, 'bpmn:SubProcess')) {
      const childScope = this._simulator.findScope({
        parent: scope,
        element: scopeElement
      });

      if (!childScope) {
        throw new Error('cancel scope not found');
      }

      this._simulator.destroyScope(childScope, {
        reason: 'cancel',
        element,
        scope
      });
    }

    // remove destroyed scope token
    scope.updateTokens(scopeElement, -1);
  }

  this._simulator.exit(context);
};

BoundaryEventBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

BoundaryEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];