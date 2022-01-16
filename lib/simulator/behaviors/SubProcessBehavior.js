import {
  is,
  isEventSubProcess,
  isInterrupting
} from '../util/ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];

SubProcessBehavior.prototype.signal = function(context) {
  const {
    element,
    startEvent = findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  const targetScope = scope.parent;

  const cancelActivity = isEventSubProcess(element) && isInterrupting(startEvent);

  // if we're interrupting, clear all non-interrupting
  // child scopes, remove all tokens and re-add tokens
  // to all interrupting child scopes
  if (cancelActivity) {
    scope.interrupting = true;

    this._scopeBehavior.interrupt(targetScope, scope);
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope,
    initiator: scope
  });

};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  var wait = this._waitsAtElement(element);

  if (wait) {
    return;
  }

  this.signal(context);
};

SubProcessBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

SubProcessBehavior.prototype._waitsAtElement = function(element) {
  return this._simulator.getConfig(element).wait;
};


// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}