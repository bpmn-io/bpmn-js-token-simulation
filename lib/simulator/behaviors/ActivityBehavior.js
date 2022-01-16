import {
  isMessageFlow,
  isSequenceFlow
} from '../util/ModelUtil';


export default function ActivityBehavior(simulator, scopeBehavior) {
  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;

  const elements = [
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ];

  for (const element of elements) {
    simulator.registerBehavior(element, this);
  }
}

ActivityBehavior.prototype.signal = function(context) {

  const {
    initiator,
    element
  } = context;

  const initiatingFlow = initiator && initiator.element;

  // if signaled by a message flow,
  // check for the next message flows to either
  // trigger or wait for; this implements intuitive,
  // as-you-would expect message flow execution in modeling
  // direction (left-to-right).
  if (isMessageFlow(initiatingFlow)) {

    const referencePoint = last(initiatingFlow.waypoints);

    const messageContexts = this._getMessageContexts(element, referencePoint);

    // trigger messages that are pending send
    const allProcessed = this._triggerMessages(context, messageContexts);

    if (!allProcessed) {
      return;
    }
  }

  this._simulator.exit(context);
};

ActivityBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const wait = this._waitsAtElement(element);

  const messageContexts = this._getMessageContexts(element);

  if (wait || messageContexts[0] && messageContexts[0].incoming) {
    return;
  }

  // trigger messages that are pending send
  const allProcessed = this._triggerMessages(context, messageContexts);

  if (!allProcessed) {
    return;
  }

  this._simulator.exit(context);
};

ActivityBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  const parentScope = scope.parent;

  if (scope.interrupted) {
    return this._scopeBehavior.tryExit(parentScope, scope);
  }

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  let sequenceFlowTaken = false;

  for (const outgoingFlow of element.outgoing) {

    if (!isSequenceFlow(outgoingFlow)) {
      continue;
    }

    this._simulator.enter({
      element: outgoingFlow,
      scope: parentScope
    });

    sequenceFlowTaken = true;
  }

  // element has token sink semantics
  if (!sequenceFlowTaken) {
    this._scopeBehavior.tryExit(parentScope, scope);
  }
};

ActivityBehavior.prototype._waitsAtElement = function(element) {
  return this._simulator.getConfig(element).wait;
};

ActivityBehavior.prototype._getMessageContexts = function(element, after=null) {

  const filterAfter = after ? ctx => ctx.referencePoint.x > after.x : () => true;
  const sortByReference = (a, b) => a.referencePoint.x - b.referencePoint.x;

  return [
    ...element.incoming.filter(isMessageFlow).map(flow => ({
      incoming: flow,
      referencePoint: last(flow.waypoints)
    })),
    ...element.outgoing.filter(isMessageFlow).map(flow => ({
      outgoing: flow,
      referencePoint: first(flow.waypoints)
    }))
  ].sort(sortByReference).filter(filterAfter);
};

/**
 * @param {any} context
 * @param {any[]} messageContexts
 *
 * @return {boolean} true if all message contexts got satisfied, i.e. messages sent
 */
ActivityBehavior.prototype._triggerMessages = function(context, messageContexts) {

  let i = 0;

  for (; i < messageContexts.length; i++) {
    let { outgoing } = messageContexts[i];

    if (!outgoing) {
      break;
    }

    this._simulator.signal({
      element: outgoing
    });
  }

  return !(i - messageContexts.length);
};

ActivityBehavior.$inject = [ 'simulator', 'scopeBehavior' ];


// helpers //////////////////

function first(arr) {
  return arr && arr[0];
}

function last(arr) {
  return arr && arr[arr.length - 1];
}