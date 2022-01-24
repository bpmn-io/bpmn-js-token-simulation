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

ActivityBehavior.$inject = [ 'simulator', 'scopeBehavior' ];

ActivityBehavior.prototype.signal = function(context) {

  // trigger messages that are pending send
  const event = this._triggerMessages(context);

  if (event) {
    return this._subscribe(context, event);
  }

  this._simulator.exit(context);
};

ActivityBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const wait = this._waitsAtElement(element);

  if (wait) {
    return this._subscribe(context, {
      element,
      type: 'pause',
      interrupting: false,
      boundary: false
    });
  }

  // trigger messages that are pending send
  const event = this._triggerMessages(context);

  if (event) {
    return this._subscribe(context, event);
  }

  this._simulator.exit(context);
};

ActivityBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  const parentScope = scope.parent;

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  const complete = !scope.failed;

  // if exception flow is active,
  // do not activate any outgoing flows
  const activatedFlows = complete
    ? element.outgoing.filter(isSequenceFlow)
    : [];

  activatedFlows.forEach(
    element => this._simulator.enter({
      element,
      scope: parentScope
    })
  );

  // element has token sink semantics
  if (activatedFlows.length === 0) {
    this._scopeBehavior.tryExit(parentScope, scope);
  }
};

ActivityBehavior.prototype._subscribe = function(context, event) {

  const {
    scope,
    element
  } = context;

  const subscription = this._simulator.subscribe(scope, event, initiator => {

    subscription.remove();

    return this._simulator.signal({
      scope,
      element,
      initiator
    });
  });
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
 *
 * @return {Object} event to subscribe to proceed
 */
ActivityBehavior.prototype._triggerMessages = function(context) {

  // check for the next message flows to either
  // trigger or wait for; this implements intuitive,
  // as-you-would expect message flow execution in modeling
  // direction (left-to-right).

  const {
    element,
    initiator,
    scope
  } = context;

  let messageContexts = scope.messageContexts;

  if (!messageContexts) {
    messageContexts = scope.messageContexts = this._getMessageContexts(element);
  }

  const initiatingFlow = initiator && initiator.element;

  if (isMessageFlow(initiatingFlow)) {

    // ignore out of bounds messages received;
    // user may manually advance and force send all outgoing
    // messages
    if (scope.expectedIncoming !== initiatingFlow) {
      console.debug('Simulator :: ActivityBehavior :: ignoring out-of-bounds message');

      return;
    }
  }

  while (messageContexts.length) {
    const {
      incoming,
      outgoing
    } = messageContexts.shift();

    if (incoming) {

      // force sending of all remaining messages,
      // as the user triggered the task manually (for demonstration
      // purposes
      if (!initiator) {
        continue;
      }

      // remember expected incoming for future use
      scope.expectedIncoming = incoming;

      return {
        element,
        type: 'message',
        name: incoming.id,
        interrupting: false,
        boundary: false
      };
    }

    this._simulator.signal({
      element: outgoing
    });
  }

};


// helpers //////////////////

function first(arr) {
  return arr && arr[0];
}

function last(arr) {
  return arr && arr[arr.length - 1];
}