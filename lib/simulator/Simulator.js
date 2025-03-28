import Ids from 'ids';

import Scope from './Scope';
import { ScopeTraits } from './ScopeTraits';

import {
  filterSet,
  findSet
} from './util/SetUtil';

import {
  eventsMatch,
  refsMatch
} from './util/EventsUtil';

import {
  getBusinessObject,
  getChildren,
  is,
  isAny,
  isBoundaryEvent,
  isCompensationEvent,
  isEventSubProcess,
  isImplicitStartEvent,
  isInterrupting,
  isStartEvent
} from './util/ModelUtil';

/**
 * @typedef { any } DiagramElement
 *
 * @typedef { {
 *   element: DiagramElement,
 *   interrupting: boolean,
 *   boundary: boolean,
 *   iref?: string,
 *   ref: DiagramElement,
 *   persistent?: boolean,
 *   type: string
 * } } SimulatorEvent
 */

export default function Simulator(injector, eventBus, elementRegistry) {

  const ids = injector.get('scopeIds', false) || new Ids([ 32, 36 ]);

  // element configuration
  const configuration = {};

  const behaviors = {};

  const noopBehavior = new NoopBehavior();

  const changedElements = new Set();

  const jobs = [];

  const scopes = new Set();
  const subscriptions = new Set();

  on('tick', function() {
    for (const element of changedElements) {
      emit('elementChanged', {
        element
      });
    }

    changedElements.clear();
  });

  function queue(scope, task) {

    // add this task
    jobs.push([ task, scope ]);

    if (jobs.length !== 1) {
      return;
    }

    let next;

    while ((next = jobs[0])) {

      const [ task, scope ] = next;

      if (!scope.destroyed) {
        task();
      }

      // remove first task
      jobs.shift();
    }

    emit('tick');
  }

  function getBehavior(element) {
    return behaviors[element.type] || noopBehavior;
  }

  function signal(context) {

    const {
      element,
      parentScope,
      initiator = null,
      scope = initializeScope({
        element,
        parent: parentScope,
        initiator
      })
    } = context;

    queue(scope, function() {

      if (!scope.running) {
        scope.start();
      }

      trace('signal', {
        ...context,
        scope
      });

      getBehavior(element).signal({
        ...context,
        scope
      });

      if (scope.parent) {
        scopeChanged(scope.parent);
      }
    });

    return scope;
  }

  function enter(context) {

    const {
      element,
      scope: parentScope,
      initiator = parentScope
    } = context;

    const scope = initializeScope({
      element,
      parent: parentScope,
      initiator
    });

    queue(scope, function() {

      if (!scope.running) {
        scope.start();
      }

      trace('enter', context);

      getBehavior(element).enter({
        ...context,
        initiator,
        scope
      });

      if (scope.parent) {
        scopeChanged(scope.parent);
      }
    });

    return scope;
  }

  function exit(context) {

    const {
      element,
      scope,
      initiator = scope
    } = context;

    queue(scope, function() {

      trace('exit', context);

      getBehavior(element).exit({
        ...context,
        initiator
      });

      if (scope.running) {
        scope.complete();
      }

      destroyScope(scope, initiator);

      scope.parent && scopeChanged(scope.parent);
    });
  }

  function trigger(context) {
    const {
      event: _event,
      initiator,
      scope
    } = context;

    // behavior depends on available event subscriptions
    //
    // interrupt (one-off, clear all events)
    //   => keep interrupting boundary event sub-scriptions of same type, if available
    //
    // continue (one-off signal)
    //
    // non-interrupting (as many as needed)

    const event = getEvent(_event);

    const subscriptions = scope.subscriptions;

    let matchingSubscriptions = filterSet(
      subscriptions, subscription => eventsMatch(event, subscription.event)
    );

    if (event.type === 'error' || event.type === 'escalation') {
      const referenceSubscriptions = filterSet(
        matchingSubscriptions, subscription => refsMatch(event, subscription.event)
      );

      if (matchingSubscriptions.every(subscription => subscription.event.boundary)
          && referenceSubscriptions.some(subscription => subscription.event.boundary)
          || referenceSubscriptions.some(subscription => !subscription.event.boundary)) {
        matchingSubscriptions = referenceSubscriptions;
      }
    }

    const nonInterrupting = matchingSubscriptions.filter(
      subscription => !subscription.event.interrupting
    );

    const interrupting = matchingSubscriptions.filter(
      subscription => subscription.event.interrupting
    );

    if (!interrupting.length) {
      return nonInterrupting.map(
        subscription => subscription.triggerFn(initiator)
      ).flat();
    }

    const interrupt = interrupting.find(subscription => !subscription.event.boundary) || interrupting[0];

    const remainingSubscriptions = filterSet(
      subscriptions,
      subscription => subscription.event.persistent || isRethrow(subscription.event, interrupt.event)
    );

    subscriptions.forEach(subscription => {
      if (!remainingSubscriptions.includes(subscription)) {
        subscription.remove();
      }
    });

    return [ interrupt.triggerFn(initiator) ].flat().filter(s => s);
  }

  function subscribe(scope, event, triggerFn) {

    event = getEvent(event);

    const element = event.element;

    const subscription = {
      scope,
      event,
      element,
      triggerFn,
      remove() {
        unsubscribe(subscription);
      }
    };

    subscriptions.add(subscription);

    scope.subscriptions.add(subscription);

    if (element) {
      elementChanged(element);
    }

    return subscription;
  }

  function unsubscribe(subscription) {
    const {
      scope,
      event
    } = subscription;

    subscriptions.delete(subscription);

    scope.subscriptions.delete(subscription);

    if (event.element) {
      elementChanged(event.element);
    }
  }

  function createInternalRef(element) {
    if (
      is(element, 'bpmn:StartEvent') ||
      is(element, 'bpmn:IntermediateCatchEvent') ||
      is(element, 'bpmn:ReceiveTask') ||
      isSpecialBoundaryEvent(element)
    ) {
      return getBusinessObject(element).name || element.id;
    }

    return null;
  }

  /**
   * @param { any } element
   *
   * @return {SimulatorEvent}
   */
  function getNoneEvent(element) {
    return {
      element,
      interrupting: false,
      boundary: false,
      iref: element.id,
      type: 'none'
    };
  }

  /**
   * @param { any } element
   *
   * @return {SimulatorEvent}
   */
  function getEvent(element) {

    // do not double-return element
    if (!element.businessObject) {
      return element;
    }

    const interrupting = isInterrupting(element);
    const boundary = isBoundaryEvent(element);

    // we do create an internal reference for
    // catch-like events to ensure these can
    // be triggered via the UI exclusively
    const iref = createInternalRef(element);

    const baseEvent = {
      element,
      interrupting,
      boundary,
      ...(iref ? { iref } : {})
    };

    const eventDefinition = getEventDefinitions(element)[0];

    if (!eventDefinition) {

      return {
        ...baseEvent,
        type: isImplicitMessageCatch(element) ? 'message' : 'none'
      };
    }

    if (is(eventDefinition, 'bpmn:LinkEventDefinition')) {
      return {
        ...baseEvent,
        type: 'link',
        name: eventDefinition.name
      };
    }

    if (is(eventDefinition, 'bpmn:SignalEventDefinition')) {
      return {
        ...baseEvent,
        type: 'signal',
        ref: eventDefinition.signalRef
      };
    }

    if (is(eventDefinition, 'bpmn:TimerEventDefinition')) {
      return {
        ...baseEvent,
        type: 'timer'
      };
    }

    if (is(eventDefinition, 'bpmn:ConditionalEventDefinition')) {
      return {
        ...baseEvent,
        type: 'condition',
      };
    }

    if (is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
      return {
        ...baseEvent,
        type: 'escalation',
        ref: eventDefinition.escalationRef
      };
    }

    if (is(eventDefinition, 'bpmn:CancelEventDefinition')) {
      return {
        ...baseEvent,
        type: 'cancel'
      };
    }

    if (is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
      return {
        ...baseEvent,
        type: 'error',
        ref: eventDefinition.errorRef
      };
    }

    if (is(eventDefinition, 'bpmn:MessageEventDefinition')) {
      return {
        ...baseEvent,
        type: 'message',
        ref: eventDefinition.messageRef
      };
    }

    if (is(eventDefinition, 'bpmn:CompensateEventDefinition')) {

      let ref = eventDefinition.activityRef && elementRegistry.get(eventDefinition.activityRef.id);

      if (!ref) {

        if (isStartEvent(element) && isEventSubProcess(element.parent)) {

          // start event in event sub-process compensates
          // parent process (or participant)
          ref = element.parent.parent;
        } else if (isBoundaryEvent(element)) {

          // boundary event compensates activity it is attached to
          ref = element.host;
        } else {

          // parent is cancel scope
          ref = element.parent;
        }
      }

      return {
        ...baseEvent,
        type: 'compensate',
        ref,
        persistent: true
      };
    }

    throw new Error('unknown event definition', eventDefinition);
  }

  function createScope(context, emitEvent = true) {

    const {
      element,
      parent: parentScope,
      initiator
    } = context;

    emitEvent && trace('createScope', {
      element,
      scope: parentScope
    });

    const scope = new Scope(ids.next(), element, parentScope, initiator);

    if (parentScope) {
      parentScope.children.push(scope);
    }

    scopes.add(scope);

    emitEvent && emit('createScope', {
      scope
    });

    elementChanged(element);

    if (parentScope) {
      elementChanged(parentScope.element);
    }

    return scope;
  }

  function subscriptionFilter(filter) {

    if (typeof filter === 'function') {
      return filter;
    }

    const {
      event: _event,
      element,
      scope
    } = filter;

    const elements = filter.elements || (element && [ element ]);
    const event = _event && getEvent(_event);

    return (
      (subscription) =>
        (!event || eventsMatch(event, subscription.event)) &&
        (!elements || elements.includes(subscription.element)) &&
        (!scope || scope === subscription.scope)
    );
  }

  function scopeSubscriptionFilter(event) {
    const matchesSubscription = event === 'function' ? event : subscriptionFilter(event);

    return (
      scope => Array.from(scope.subscriptions).some(matchesSubscription)
    );
  }

  function scopeFilter(filter) {

    if (typeof filter === 'function') {
      return filter;
    }

    const {
      element,
      waitsOnElement,
      parent,
      trait = ScopeTraits.RUNNING,
      subscribedTo
    } = filter;

    const isSubscribed = subscribedTo ? scopeSubscriptionFilter(subscribedTo) : () => true;

    return (
      scope =>
        (!element || scope.element === element) &&
        (!parent || scope.parent === parent) &&
        (!waitsOnElement || scope.getTokensByElement(waitsOnElement) > 0) &&
        scope.hasTrait(trait) &&
        isSubscribed(scope)
    );
  }

  function findSubscriptions(filter) {
    return filterSet(subscriptions, subscriptionFilter(filter));
  }

  function findSubscription(filter) {
    return findSet(subscriptions, subscriptionFilter(filter));
  }

  function findScopes(filter) {
    return filterSet(scopes, scopeFilter(filter));
  }

  function findScope(filter) {
    return findSet(scopes, scopeFilter(filter));
  }

  function destroyScope(scope, initiator = null) {

    if (scope.destroyed) {
      return;
    }

    scope.destroy(initiator);

    // remove outdated subscriptions
    for (const subscription of scope.subscriptions) {
      const trait = subscription.event.traits || ScopeTraits.ACTIVE;

      if (!scope.hasTrait(trait)) {
        unsubscribe(subscription);
      }
    }

    // depending on taken transition scope many not actually
    // be destroyed but in an inactive / completed state
    //
    // only perform additional destructive operations in case we're
    // actually DEAD.
    if (scope.destroyed) {

      // destroy child scopes
      for (const childScope of scope.children) {
        if (!childScope.destroyed) {
          destroyScope(childScope, initiator);
        }
      }

      trace('destroyScope', {
        element: scope.element,
        scope
      });

      // remove dead scope
      scopes.delete(scope);

      emit('destroyScope', {
        scope
      });
    }

    elementChanged(scope.element);

    if (scope.parent) {
      elementChanged(scope.parent.element);
    }
  }

  function trace(action, context) {

    emit('trace', {
      ...context,
      action
    });
  }

  function elementChanged(element) {
    changedElements.add(element);

    // tick, unless jobs are queued
    // (and tick is going to happen naturally)
    if (!jobs.length) {
      emit('tick');
    }
  }

  function scopeChanged(scope) {
    emit('scopeChanged', {
      scope
    });
  }

  function emit(event, payload = {}) {
    return eventBus.fire(`tokenSimulation.simulator.${event}`, payload);
  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  function setConfig(element, updatedConfig) {

    const existingConfig = getConfig(element);

    configuration[element.id || element] = {
      ...existingConfig,
      ...updatedConfig
    };

    elementChanged(element);
  }

  function initializeRootScopes() {

    const rootScopes = [];

    elementRegistry.forEach(element => {

      if (!isAny(element, [ 'bpmn:Process', 'bpmn:Participant' ])) {
        return;
      }

      const scope = createScope({
        element
      }, false);

      rootScopes.push(scope);

      const startEvents = element.children.filter(isStartEvent);

      const implicitStartEvents = element.children.filter(isImplicitStartEvent);

      for (const startEvent of startEvents) {

        const event = {
          ...getEvent(startEvent),
          interrupting: false
        };

        // start events can always be triggered
        subscribe(scope, event, initiator => signal({
          element,
          startEvent: startEvent,
          initiator
        }));
      }

      if (!startEvents.length) {

        for (const implicitStartEvent of implicitStartEvents) {

          const event = getNoneEvent(implicitStartEvent);

          // start events can always be triggered
          subscribe(scope, event, initiator => signal({
            element,
            initiator
          }));
        }
      }
    });

    return rootScopes;
  }

  function initializeScope(context) {

    const {
      element
    } = context;

    const scope = createScope(context);

    const {
      attachers = []
    } = element;

    const children = getChildren(element, elementRegistry);

    for (const childElement of children) {

      // event sub-process start events
      if (isEventSubProcess(childElement)) {
        const startEvents = getChildren(childElement, elementRegistry).filter(
          element => isStartEvent(element) && !isCompensationEvent(element)
        );

        for (const startEvent of startEvents) {
          subscribe(scope, startEvent, initiator => {

            return signal({
              element: childElement,
              parentScope: scope,
              startEvent,
              initiator
            });
          });
        }
      }
    }

    for (const attacher of attachers) {

      // boundary events
      if (isBoundaryEvent(attacher) && !isCompensationEvent(attacher)) {

        subscribe(scope, attacher, initiator => {
          return signal({
            element: attacher,
            parentScope: scope.parent,
            hostScope: scope,
            initiator
          });
        });
      }
    }

    return scope;
  }

  function getConfig(element) {
    return configuration[element.id || element] || {};
  }

  function waitForScopes(scope, scopes) {

    if (!scopes.length) {
      return;
    }

    const event = {
      type: 'all-completed',
      persistent: false
    };

    const remainingScopes = new Set(scopes);

    const destroyListener = (destroyEvent) => {
      remainingScopes.delete(destroyEvent.scope);

      if (remainingScopes.size === 0) {
        off('destroyScope', destroyListener);

        trigger({
          scope,
          event
        });
      }
    };

    on('destroyScope', destroyListener);

    return event;
  }

  function waitAtElement(element, wait = true) {
    setConfig(element, {
      wait
    });
  }

  function reset() {
    for (const scope of scopes) {
      destroyScope(scope);
    }

    for (const rootScope of initializeRootScopes()) {
      scopes.add(rootScope);
    }

    // TODO(nikku): clear configuration?

    emit('tick');
    emit('reset');
  }

  // utilties
  this.createScope = createScope;
  this.destroyScope = destroyScope;

  // inspection
  this.findScope = findScope;
  this.findScopes = findScopes;

  this.findSubscription = findSubscription;
  this.findSubscriptions = findSubscriptions;

  // configuration
  this.waitAtElement = waitAtElement;

  this.waitForScopes = waitForScopes;

  this.setConfig = setConfig;
  this.getConfig = getConfig;

  // driving simulation forward
  this.signal = signal;
  this.enter = enter;
  this.exit = exit;

  // BPMN event subscriptions and triggers
  this.subscribe = subscribe;
  this.trigger = trigger;

  // life-cycle
  this.reset = reset;

  // emitter
  this.on = on;
  this.off = off;

  // extension
  this.registerBehavior = function(element, behavior) {
    behaviors[element] = behavior;
  };
}

Simulator.$inject = [
  'injector',
  'eventBus',
  'elementRegistry'
];


// helpers /////////////////

function NoopBehavior() {

  this.signal = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.exit = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.enter = function(context) {
    console.log('ignored #enter', context.element);
  };

}

function isRethrow(event, interrupt) {
  return (
    event.boundary && !interrupt.boundary
  );
}

function isImplicitMessageCatch(element) {
  return is(element, 'bpmn:ReceiveTask') || element.incoming.some(element => is(element, 'bpmn:MessageFlow'));
}

function isSpecialBoundaryEvent(element) {
  if (!isBoundaryEvent(element)) {
    return false;
  }

  const eventDefinitions = getEventDefinitions(element);

  return !eventDefinitions[0] || isAny(eventDefinitions[0], [
    'bpmn:ConditionalEventDefinition', 'bpmn:TimerEventDefinition'
  ]);
}

function getEventDefinitions(element) {
  return element.businessObject.get('eventDefinitions') || [];
}
