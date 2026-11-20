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


const COMPENSATED_EVENT = {
  type: 'compensated'
};


/**
 * Compensation, as per BPMN 2.0.2 § 13.5.5: Only successfully completed
 * activities are compensated, one after another, in reverse order of
 * their completion.
 */
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

/**
 * Register compensation handlers for a successfully completed activity.
 *
 * @param {Scope} scope
 */
CompensationBehavior.prototype.registerCompensation = function(scope) {
  this._registerHandlers(scope);
  this._registerCompensableScope(scope);
};

/**
 * Compensate completed activities from within <scope>, as triggered
 * by a compensation throw event.
 *
 * @param {Object} context
 * @param {Scope} context.scope scope of the throw event
 * @param {Scope} context.subscriptionScope scope to compensate activities in
 * @param {Object} [context.ref] activity to compensate; all activities if not given
 *
 * @return {Object|undefined} event to wait for, if compensation is in progress
 */
CompensationBehavior.prototype.compensate = function(context) {

  const {
    scope,
    subscriptionScope,
    ref
  } = context;

  const handlers = this._getHandlers(subscriptionScope).filter(
    handler => ref ? handler.event.ref === ref : handler.event.ref !== subscriptionScope.element
  );

  const next = () => {

    while (handlers.length) {
      const scopes = this._triggerHandler(handlers.shift(), scope);

      if (scopes.length) {
        const event = this._simulator.waitForScopes(scope, scopes);

        const subscription = this._simulator.subscribe(scope, event, () => {
          subscription.remove();

          next();
        });

        return COMPENSATED_EVENT;
      }
    }

    this._simulator.trigger({
      scope,
      event: COMPENSATED_EVENT
    });
  };

  return next();
};

/**
 * Compensate a scope: run its own compensation handlers, then compensate
 * all of its completed activities; exit the scope after that.
 *
 * @param {Object} context
 * @param {Scope} context.scope
 */
CompensationBehavior.prototype.compensateScope = function(context) {

  const {
    scope
  } = context;

  const handlers = this._getHandlers(scope);

  // own handlers (in order of registration) first, then child activity handlers
  const ownHandlers = handlers.filter(handler => handler.event.ref === scope.element).reverse();
  const childHandlers = handlers.filter(handler => handler.event.ref !== scope.element);

  for (const handler of [ ...ownHandlers, ...childHandlers ]) {
    this._scopeBehavior.preExit(scope, initiator => {
      return this._triggerHandler(handler, initiator);
    });
  }
};

// in reverse order of registration, i.e. completion
CompensationBehavior.prototype._getHandlers = function(scope) {
  return filterSet(
    scope.subscriptions,
    subscription => eventsMatch({ type: 'compensate' }, subscription.event)
  ).reverse();
};

CompensationBehavior.prototype._triggerHandler = function(handler, initiator) {

  // handler may have been triggered in the meantime
  if (!handler.scope.subscriptions.has(handler)) {
    return [];
  }

  return [ handler.triggerFn(initiator) ].flat();
};

CompensationBehavior.prototype._registerHandlers = function(scope) {

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

  scope.compensable();
};

/**
 * Subscribe to compensation of a compensable scope in its parent,
 * once it completed successfully. Only completed scopes can be compensated.
 */
CompensationBehavior.prototype._registerCompensableScope = function(scope) {

  if (!scope.hasTrait(ScopeTraits.COMPENSABLE)) {
    return;
  }

  const parentScope = scope.parent;

  const compensateEvent = {
    type: 'compensate',
    ref: scope.element,
    persistent: true,
    traits: ScopeTraits.NOT_DEAD
  };

  const subscription = this._simulator.subscribe(parentScope, compensateEvent, initiator => {

    subscription.remove();

    // scope may have been destroyed in the meantime,
    // i.e. after its children got compensated manually
    if (scope.destroyed) {
      return [];
    }

    scope.fail(initiator);

    this.compensateScope({
      scope
    });

    this._scopeBehavior.tryExit(scope, initiator);

    return scope;
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


// helpers ///////////////

function noCompensationContext(scope) {
  throw new Error(`no compensation context for <${scope.id}>`);
}
