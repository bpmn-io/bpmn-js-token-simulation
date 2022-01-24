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
    scope,
    hostScope = this._simulator.findScope({
      parent: scope.parent,
      element: element.host
    })
  } = context;

  if (!hostScope) {
    throw new Error('host scope not found');
  }

  const cancelActivity = getBusinessObject(element).cancelActivity;

  if (cancelActivity) {
    this._scopeBehavior.interrupt(hostScope, scope);

    // activities are pending completion before actual exit
    const event = this._scopeBehavior.tryExit(hostScope, scope);

    if (event) {
      const subscription = this._simulator.subscribe(hostScope, event, initiator => {
        subscription.remove();

        return this._simulator.exit(context);
      });

      return;
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