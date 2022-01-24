import {
  is,
  isEventSubProcess,
  isInterrupting
} from '../util/ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior,
    transactionBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;
  this._transactionBehavior = transactionBehavior;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior',
  'transactionBehavior'
];

SubProcessBehavior.prototype.signal = function(context) {
  this._start(context);
};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const continueEvent = this._activityBehavior.waitAtElement(element);

  if (continueEvent) {
    return this._activityBehavior.signalOnEvent(context, continueEvent);
  }

  this._start(context);
};

SubProcessBehavior.prototype.exit = function(context) {

  const {
    scope
  } = context;

  const parentScope = scope.parent;

  // successful completion of the fail initiator (event sub-process)
  // recovers the parent, so that the normal flow is being executed
  if (parentScope.failInitiator === scope) {
    parentScope.complete();
  }

  this._activityBehavior.exit(context);
};

SubProcessBehavior.prototype._start = function(context) {
  const {
    element,
    startEvent = findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  const targetScope = scope.parent;

  if (targetScope.destroyed) {
    throw new Error(`target scope <${targetScope.id}> destroyed`);
  }

  if (isTransaction(element)) {
    this._transactionBehavior.setup(context);
  }

  const cancelActivity = isEventSubProcess(element) && isInterrupting(startEvent);

  if (cancelActivity) {
    this._scopeBehavior.interrupt(targetScope, scope);
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope,
    initiator: scope
  });
};

// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}

function isTransaction(element) {
  return is(element, 'bpmn:Transaction');
}