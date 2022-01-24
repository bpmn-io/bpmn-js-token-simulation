import {
  isAny,
  isCompensationEvent,
  isCompensationActivity,
  isEventSubProcess,
  isStartEvent
} from '../util/ModelUtil';

import {
  eventsMatch
} from '../util/EventsUtil';

import {
  filterSet
} from '../util/SetUtil';


const CANCEL_EVENT = {
  type: 'cancel',
  interrupting: true,
  boundary: false,
  persistent: true
};


export default function TransactionBehavior(simulator, scopeBehavior) {
  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;
}

TransactionBehavior.$inject = [
  'simulator',
  'scopeBehavior'
];

TransactionBehavior.prototype.setup = function(context) {

  const {
    scope
  } = context;

  const cancelSubscription = this._simulator.subscribe(scope, CANCEL_EVENT, (initiator) => {

    cancelSubscription.remove();

    return this.cancel({
      scope,
      initiator
    });
  });

  const compensateEvent = {
    type: 'compensate',
    ref: scope.element,
    interrupting: true,
    boundary: false,
    persistent: true
  };

  const compensateSubscription = this._simulator.subscribe(scope, compensateEvent, (initiator) => {

    // need to trigger ordinary
    // transaction cancelation
    if (!scope.canceled) {
      return this._simulator.trigger({
        event: CANCEL_EVENT,
        scope
      });
    }

    compensateSubscription.remove();

    return this.compensate({
      scope,
      element: scope.element,
      initiator
    });
  });
};

TransactionBehavior.prototype.cancel = function(context) {

  const {
    scope,
    initiator
  } = context;

  // bail out on double cancel
  if (scope.destroyed) {
    return;
  }

  // mark scope as canceled
  scope.cancel(initiator);

  // trigger compensation on element
  this._simulator.trigger({
    event: {
      type: 'compensate',
      ref: scope.element
    },
    initiator,
    scope
  });

  // re-trigger cancel (to trigger boundary cancel events)
  return this._simulator.trigger({
    scope,
    initiator,
    event: CANCEL_EVENT
  });
};

TransactionBehavior.prototype.registerCompensation = function(scope) {

  const {
    element
  } = scope;

  const transactionScope = this.findTransactionScope(scope);

  // check for compensation triggers
  //
  // * embedded compensation event sub-processes
  // * compensation boundary events

  const compensateStartEvents = element.children.filter(
    isEventSubProcess
  ).map(
    element => element.children.find(
      element => isStartEvent(element) && isCompensationEvent(element)
    )
  ).filter(s => s);

  for (const startEvent of compensateStartEvents) {

    const compensationEvent = {
      element: startEvent,
      type: 'compensate',
      persistent: true,
      interrupting: true,
      boundary: false,
      ref: element
    };

    const compensateEventSub = startEvent.parent;

    const subscription = this._simulator.subscribe(transactionScope, compensationEvent, initiator => {

      subscription.remove();

      return this._simulator.signal({
        initiator,
        element: compensateEventSub,
        parentScope: scope
      });
    });
  }

  const compensateBoundaryEvents = element.attachers.filter(isCompensationEvent);

  for (const boundaryEvent of compensateBoundaryEvents) {

    const compensationEvent = {
      element: boundaryEvent,
      type: 'compensate',
      interrupting: true,
      boundary: true,
      persistent: true,
      ref: element
    };

    const compensateActivity = boundaryEvent.outgoing.map(
      outgoing => outgoing.target
    ).find(
      isCompensationActivity
    );

    if (!compensateActivity) {
      continue;
    }

    const subscription = this._simulator.subscribe(transactionScope, compensationEvent, initiator => {

      subscription.remove();

      // enter compensate activity like normal task
      return this._simulator.enter({
        initiator,
        element: compensateActivity,
        scope: transactionScope
      });
    });
  }
};

TransactionBehavior.prototype.findTransactionScope = function(scope) {

  let parentScope = scope;

  while (parentScope) {
    const element = parentScope.element;

    if (isAny(element, [ 'bpmn:Transaction', 'bpmn:Process', 'bpmn:Participant' ])) {
      return parentScope;
    }

    parentScope = parentScope.parent;
  }

  throw noTransactionContext(scope);
};

TransactionBehavior.prototype.compensate = function(context) {

  const {
    scope,
    element
  } = context;

  // compensate all
  const compensateSubscriptions = filterSet(
    scope.subscriptions,
    subscription => eventsMatch({ type: 'compensate' }, subscription.event)
  );

  const localSubscriptions = compensateSubscriptions.filter(subscription => subscription.event.ref === element);

  const otherSubscriptions = compensateSubscriptions.filter(subscription => subscription.event.ref !== element);

  for (const subscription of localSubscriptions) {
    this._scopeBehavior.preExit(scope, initiator => {
      return this._simulator.trigger(subscription);
    });
  }

  for (const subscription of otherSubscriptions.reverse()) {
    this._scopeBehavior.preExit(scope, initiator => {
      return this._simulator.trigger(subscription);
    });
  }
};


// helpers ///////////////

function noTransactionContext(scope) {
  throw new Error(`no transaction context for <${scope.id}>`);
}