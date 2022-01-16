import {
  getBusinessObject
} from '../util/ModelUtil';


export default function BoundaryEventBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

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

    const cancelScope = this._simulator.findScope({
      parent: scope.parent,
      element: scopeElement
    });

    if (!cancelScope) {
      throw new Error('cancel scope not found');
    }

    this._scopeBehavior.interrupt(cancelScope, scope);

    // attempt child scope exit
    // may fail if interrupting activities are still running
    this._scopeBehavior.tryExit(cancelScope, scope);
  }

  this._simulator.exit(context);
};

BoundaryEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

BoundaryEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];