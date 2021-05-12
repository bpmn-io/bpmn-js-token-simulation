import {
  getBusinessObject,
  isEventSubProcess
} from './ModelUtil';


export default function StartEventBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:StartEvent', this);
}

StartEventBehavior.prototype.signal = function(context) {

  const {
    element,
    parentScope,
    scope
  } = context;

  const {
    parent: parentElement
  } = element;

  // trigger event sub-process
  if (isEventSubProcess(parentElement)) {

    if (!parentScope) {
      throw new Error('missing <parentScope>');
    }

    if (getBusinessObject(element).isInterrupting) {
      this._simulator.destroyScope(parentScope, {
        reason: 'cancel',
        ...context
      }, [ scope ]);
    }
  }

  this._simulator.exit(context);
};

StartEventBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

StartEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];