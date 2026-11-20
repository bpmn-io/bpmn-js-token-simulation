import {
  ScopeTraits
} from '../ScopeTraits';

import {
  getChildren,
  isAny,
  isCompensationEvent,
  isCompensationActivity,
  isEventSubProcess,
  isStartEvent,
  is
} from '../util/ModelUtil';

import {
  eventsMatch
} from '../util/EventsUtil';

import {
  filterSet
} from '../util/SetUtil';



export default function CompensationBehavior(simulator, scopeBehavior, elementRegistry) {
  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;
  this._elementRegistry = elementRegistry;
}

CompensationBehavior.$inject = [
  'simulator',
  'scopeBehavior',
  'elementRegistry'
];

CompensationBehavior.prototype.registerCompensation = function(scope) {

  const {
    element
  } = scope;

  // check for compensation triggers
  //
  // * embedded compensation event sub-processes
  // * compensation boundary events

  const children = getChildren(element, this._elementRegistry);

  const compensateStartEvents = children.filter(
    isEventSubProcess
  ).map(
    element => getChildren(element, this._elementRegistry).find(
      element => isStartEvent(element) && isCompensationEvent(element)
    )
  ).filter(s => s);

  const compensateBoundaryEvents = element.attachers.filter(isCompensationEvent);

  if (!compensateStartEvents.length && !compensateBoundaryEvents.length) {
    return;
  }

  const compensationScope = this._findCompensationScope(scope);

  // sub processes may enter a <compensable> state
  // in that state they are kept alive on exit
  // until the parent gets destroyed; as long as they are kept alive
  // compensation can happen on them
  //
  if (!is(compensationScope.element, 'bpmn:Transaction')) {
    this._makeCompensable(compensationScope);
  }

  for (const startEvent of compensateStartEvents) {

    const compensationEvent = {
      element: startEvent,
      type: 'compensate',
      persistent: true,
      interrupting: true,
      ref: element,
      traits: ScopeTraits.NOT_DEAD
    };

    const compensateEventSub = startEvent.parent;

    const subscription = this._simulator.subscribe(scope, compensationEvent, initiator => {

      subscription.remove();

      return this._simulator.signal({
        initiator,
        element: compensateEventSub,
        startEvent,
        parentScope: scope
      });
    });
  }

  for (const boundaryEvent of compensateBoundaryEvents) {

    const compensationEvent = {
      element: boundaryEvent,
      type: 'compensate',
      persistent: true,
      ref: element,
      traits: ScopeTraits.NOT_DEAD
    };

    const compensateActivity = boundaryEvent.outgoing.map(
      outgoing => outgoing.target
    ).find(
      isCompensationActivity
    );

    if (!compensateActivity) {
      continue;
    }

    const subscription = this._simulator.subscribe(compensationScope, compensationEvent, initiator => {

      subscription.remove();

      // enter compensate activity like normal task
      return this._simulator.enter({
        initiator,
        element: compensateActivity,
        scope: compensationScope
      });
    });
  }
};

CompensationBehavior.prototype._makeCompensable = function(scope) {

  if (scope.hasTrait(ScopeTraits.COMPENSABLE) || !scope.parent) {
    return;
  }

  const compensateEvent = {
    type: 'compensate',
    ref: scope.element,
    interrupting: true,
    persistent: true,
    traits: ScopeTraits.NOT_DEAD
  };

  scope.compensable();

  const scopeSub = this._simulator.subscribe(scope, compensateEvent, (initiator) => {

    scopeSub.remove();

    scope.fail(initiator);

    this.compensateScope({
      scope
    });

    this._scopeBehavior.tryExit(scope, initiator);

    return scope;
  });

  const parentScope = scope.parent;

  if (!parentScope) {
    return;
  }

  const parentSub = this._simulator.subscribe(parentScope, compensateEvent, initiator => {

    parentSub.remove();

    return this._simulator.trigger({
      scope,
      event: compensateEvent,
      initiator
    });

  });

  this._makeCompensable(parentScope);
};

CompensationBehavior.prototype._findCompensationScope = function(scope) {

  let parentScope = scope;

  while (parentScope) {
    const element = parentScope.element;

    if (is(element, 'bpmn:SubProcess') && !isEventSubProcess(element)) {
      return parentScope;
    }

    if (isAny(element, [
      'bpmn:Transaction',
      'bpmn:Process',
      'bpmn:Participant'
    ])) {
      return parentScope;
    }

    parentScope = parentScope.parent;
  }

  throw noCompensationContext(scope);
};

CompensationBehavior.prototype.compensateScope = function(context) {

  const {
    scope
  } = context;

  const {
    element
  } = scope;

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

function noCompensationContext(scope) {
  throw new Error(`no compensation context for <${scope.id}>`);
}
