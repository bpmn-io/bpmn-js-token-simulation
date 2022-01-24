import {
  getEventDefinition,
  isTypedEvent
} from '../../util/ElementHelper';

import {
  ScopeTraits
} from '../ScopeTraits';

import {
  isEventSubProcess,
  isLinkCatch
} from '../util/ModelUtil';


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

      const linkTargets = parentElement.children.filter(element =>
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

      // HINT: errors are handled in current scope only (does not bubble)

      const {
        element,
        scope
      } = context;

      // TODO(nikku): ensure error always interrupts, also if no error
      //              catch is present
      this._simulator.trigger({
        event: element,
        initiator: scope,
        scope: findSubscriptionScope(scope)
      });
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

      return this._simulator.waitForScopes(
        scope,
        this._simulator.trigger({
          event: element,
          scope: findSubscriptionScope(scope)
        })
      );
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

function findSubscriptionScope(scope) {

  // the scope is the first non event sub-process
  while (isEventSubProcess(scope.parent.element)) {
    scope = scope.parent;
  }

  return scope.parent;
}