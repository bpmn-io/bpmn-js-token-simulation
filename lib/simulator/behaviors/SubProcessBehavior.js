import {
  getChildren,
  is,
  isEventSubProcess,
  isInterrupting,
  isStartEvent,
  isNoneStartEvent,
  isImplicitStartEvent
} from '../util/ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior,
    transactionBehavior,
    elementRegistry) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;
  this._transactionBehavior = transactionBehavior;
  this._elementRegistry = elementRegistry;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior',
  'transactionBehavior',
  'elementRegistry'
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
    startEvent,
    scope
  } = context;

  const targetScope = scope.parent;

  if (isEventSubProcess(element)) {

    if (!startEvent) {
      throw new Error('missing <startEvent>: required for event sub-process');
    }
  } else {
    if (startEvent) {
      throw new Error('unexpected <startEvent>: not allowed for sub-process');
    }
  }

  if (targetScope.destroyed) {
    throw new Error(`target scope <${targetScope.id}> destroyed`);
  }

  if (isTransaction(element)) {
    this._transactionBehavior.setup(context);
  }

  if (startEvent && isInterrupting(startEvent)) {
    this._scopeBehavior.interrupt(targetScope, scope);
  }

  const startNodes = this._findStarts(element, startEvent);

  for (const element of startNodes) {

    if (isStartEvent(element)) {
      this._simulator.signal({
        element,
        parentScope: scope,
        initiator: scope
      });
    } else {
      this._simulator.enter({
        element,
        scope,
        initiator: scope
      });
    }
  }

  if (!startNodes.length) {
    this._simulator.exit(context);
  }
};

SubProcessBehavior.prototype._findStarts = function(element, startEvent) {
  const isStartEvent = startEvent
    ? (node) => startEvent === node
    : (node) => isNoneStartEvent(node);

  return getChildren(element, this._elementRegistry).filter(
    node => (
      isStartEvent(node) || isImplicitStartEvent(node)
    )
  );
};

function isTransaction(element) {
  return is(element, 'bpmn:Transaction');
}
