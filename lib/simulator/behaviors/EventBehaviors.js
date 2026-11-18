import {
  getEventDefinition,
  isTypedEvent
} from '../../util/ElementHelper';

import {
  ScopeTraits
} from '../ScopeTraits';

import {
  getChildren,
  isEventSubProcess,
  isLinkCatch
} from '../util/ModelUtil';

import {
  eventsMatch
} from '../util/EventsUtil';

import {
  filterSet
} from '../util/SetUtil';


export default function EventBehaviors(
    simulator,
    elementRegistry,
    scopeBehavior) {

  this._simulator = simulator;
  this._elementRegistry = elementRegistry;
  this._scopeBehavior = scopeBehavior;
}

EventBehaviors.$inject = [
  'simulator',
  'elementRegistry',
  'scopeBehavior'
];


EventBehaviors.prototype.get = function(element) {

  const behaviors = {
    'bpmn:LinkEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      const link = getLinkDefinition(element);

      const parentScope = scope.parent;
      const parentElement = parentScope.element;
      const children = getChildren(parentElement, this._elementRegistry);

      const linkTargets = children.filter(element =>
        isLinkCatch(element) &&
        getLinkDefinition(element).name === link.name
      );

      for (const linkTarget of linkTargets) {
        this._simulator.signal({
          element: linkTarget,
          parentScope,
          initiator: scope
        });
      }
    },

    'bpmn:SignalEventDefinition': (context) => {

      // HINT: signals work only within the whole diagram,
      //       triggers start events, boundary events and
      //       intermediate catch events

      const {
        element,
        scope
      } = context;

      const subscriptions = this._simulator.findSubscriptions({
        event: element
      });

      const signaledScopes = new Set();

      for (const subscription of subscriptions) {

        const signaledScope = subscription.scope;

        if (signaledScopes.has(signaledScope)) {
          continue;
        }

        signaledScopes.add(signaledScope);

        this._simulator.trigger({
          event: element,
          scope: signaledScope,
          initiator: scope
        });
      }
    },

    'bpmn:EscalationEventDefinition': (context) => {

      // HINT: escalations are propagated up the scope
      //       chain and caught by the first matching boundary event
      //       or event sub-process

      const {
        element,
        scope
      } = context;

      const scopes = this._simulator.findScopes({
        subscribedTo: {
          event: element
        },
        trait: ScopeTraits.ACTIVE
      });

      let triggerScope = scope;

      while ((triggerScope = triggerScope.parent)) {

        if (scopes.includes(triggerScope)) {
          this._simulator.trigger({
            event: element,
            scope: triggerScope,
            initiator: scope
          });

          break;
        }
      }

    },

    'bpmn:ErrorEventDefinition': (context) => {

      // HINT: errors are propagated up the scope
      //       chain and caught by the first matching boundary event
      //       or event sub-process

      const {
        element,
        scope
      } = context;

      const scopes = this._simulator.findScopes({
        subscribedTo: {
          event: element
        },
        trait: ScopeTraits.ACTIVE
      });

      let triggerScope = scope;

      // TODO(nikku): ensure error always interrupts, also if no error
      //              catch is present
      while ((triggerScope = triggerScope.parent)) {

        if (scopes.includes(triggerScope)) {
          this._simulator.trigger({
            event: element,
            scope: triggerScope,
            initiator: scope
          });

          break;
        }
      }
    },

    'bpmn:TerminateEventDefinition': (context) => {
      const {
        scope
      } = context;

      this._scopeBehavior.terminate(scope.parent, scope);
    },

    'bpmn:CancelEventDefinition': (context) => {

      // HINT: cancels the surrounding transaction scope (does not bubble)

      const {
        scope,
        element
      } = context;

      this._simulator.trigger({
        event: element,
        initiator: scope,
        scope: findSubscriptionScope(scope)
      });
    },

    'bpmn:CompensateEventDefinition': (context) => {

      const {
        scope,
        element
      } = context;

      const subscriptionScope = findSubscriptionScope(scope);

      const compensationScopes = hasActivityRef(element)
        ? this._simulator.trigger({
          event: element,
          scope: subscriptionScope
        })
        : compensateAllCompletedActivities(subscriptionScope);

      return this._simulator.waitForScopes(scope, compensationScopes);
    }
  };

  const entry = Object.entries(behaviors).find(
    entry => isTypedEvent(element, entry[0])
  );

  return entry && entry[1];
};


// helpers ///////////////

function getLinkDefinition(element) {
  return getEventDefinition(element, 'bpmn:LinkEventDefinition');
}

function hasActivityRef(element) {
  return !!getEventDefinition(element, 'bpmn:CompensateEventDefinition').activityRef;
}

function compensateAllCompletedActivities(scope) {

  const compensations = filterSet(
    scope.subscriptions,
    subscription => isCompletedChildCompensation(subscription, scope)
  ).reverse();

  return compensations
    .filter(subscription => scope.subscriptions.has(subscription))
    .flatMap(subscription => [ subscription.triggerFn() ].flat())
    .filter(compensationScope => compensationScope);
}

function isCompletedChildCompensation(subscription, scope) {

  const {
    event
  } = subscription;

  return (
    eventsMatch({ type: 'compensate' }, event) &&
    event.ref !== scope.element &&
    (!event.compensatedScope || event.compensatedScope.completed)
  );
}

function findSubscriptionScope(scope) {

  // the scope is the first non event sub-process
  while (isEventSubProcess(scope.parent.element)) {
    scope = scope.parent;
  }

  return scope.parent;
}