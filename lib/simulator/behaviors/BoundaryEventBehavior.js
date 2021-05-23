import {
  getBusinessObject
} from './ModelUtil';


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

    const initiator = {
      element,
      scope
    };

    this._scopeBehavior.interrupt(cancelScope, initiator);

    if (this._scopeBehavior.isFinished(cancelScope)) {

      // attempt child scope exit
      // may fail if interrupting activities are still running
      this._scopeBehavior.exit({
        scope: cancelScope,
        initiator
      });
    }
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