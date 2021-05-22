import {
  getEventDefinition,
  getBusinessObject,
  is,
  isTypedEvent
} from '../../util/ElementHelper';


export default function EventBehaviors(
    simulator,
    elementRegistry) {

  this._simulator = simulator;
  this._elementRegistry = elementRegistry;
}

EventBehaviors.prototype.get = function(element) {

  const behaviors = {
    'bpmn:LinkEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      const {
        parent: parentScope
      } = scope;

      const eventDefinition = getEventDefinition(element, 'bpmn:LinkEventDefinition');
      const name = eventDefinition.get('name');

      // HINT: links work only within the same process

      const triggerElements = this._elementRegistry.filter(e => {
        return (
          e.parent === element.parent &&
          is(e, 'bpmn:CatchEvent') &&
          isTypedEvent(e, 'bpmn:LinkEventDefinition') &&
          getEventDefinition(e, 'bpmn:LinkEventDefinition').get('name') === name
        );
      });

      for (const triggerElement of triggerElements) {
        this._simulator.enter({
          element: triggerElement,
          scope: parentScope
        });
      }
    },

    'bpmn:SignalEventDefinition': (context) => {

      const {
        element
      } = context;

      // HINT: signals work only within the whole diagram,
      //       triggers start events, boundary events and
      //       intermediate catch events

      const eventDefinition = getEventDefinition(element, 'bpmn:SignalEventDefinition');
      const signal = eventDefinition.get('signalRef');

      const triggerElements = this._elementRegistry.filter(e => {
        return (
          is(e, 'bpmn:CatchEvent') &&
          isTypedEvent(e, 'bpmn:SignalEventDefinition') &&
          getEventDefinition(e, 'bpmn:SignalEventDefinition').get('signalRef') === signal
        );
      });

      // trigger signal events for found elements
      const triggers = triggerElements.map(triggerElement => {

        // signal the following elements
        //
        //   * start events outside of sub-processes
        //   * start events in event sub-processes with active parent scope
        //   * intermediate events with active scope
        //   * boundary events with active scope waiting in host
        //
        if (is(triggerElement, 'bpmn:StartEvent')) {

          const triggerParent = triggerElement.parent;

          const startEvent = triggerElement;

          if (is(triggerParent, 'bpmn:SubProcess')) {

            // trigger event sub-processes only
            if (getBusinessObject(triggerParent).triggeredByEvent) {
              const parentScopes = this._simulator.findScopes({
                element: triggerParent.parent
              });

              // only trigger if parent scope exists
              return parentScopes.map(parentScope => () => this._simulator.signal({
                element: triggerParent,
                startEvent,
                parentScope
              }));
            }
          } else {
            return () => this._simulator.signal({
              element: triggerElement.parent,
              startEvent
            });
          }
        }

        if (is(triggerElement, 'bpmn:IntermediateCatchEvent')) {

          // (a) scope waiting at element will be signaled
          const eventSource = triggerElement.incoming.find(
            incoming => is(incoming.source, 'bpmn:EventBasedGateway')
          );

          const scopes = this._simulator.findScopes({
            element: eventSource && eventSource.source || triggerElement
          });

          return scopes.map(scope => () => this._simulator.signal({
            element: triggerElement,
            scope
          }));
        }

        if (is(triggerElement, 'bpmn:BoundaryEvent')) {
          const scopes = this._simulator.findScopes({
            element: triggerElement.host
          });

          return scopes.map(scope => () => this._simulator.signal({
            element: triggerElement,
            parentScope: scope.parent
          }));
        }

        // nothing to trigger
        return [];
      }).flat();

      for (const trigger of triggers) {
        if (trigger) {
          trigger();
        }
      }

    },

    'bpmn:EscalationEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      // HINT: escalations are propagated up the scope
      //       chain and caught by the first matching boundary event
      //       or event sub-process

      const eventDefinition = getEventDefinition(element, 'bpmn:EscalationEventDefinition');
      const escalation = eventDefinition.get('escalationRef');

      let triggerElement, parentScope = scope.parent;

      do {

        // find event sub-process catching in scope
        triggerElement = parentScope.element.children.find(e => {
          return is(e, 'bpmn:SubProcess') && e.children.find(e => {
            return (
              is(e, 'bpmn:CatchEvent') &&
              isTypedEvent(e, 'bpmn:EscalationEventDefinition') &&
              getEventDefinition(e, 'bpmn:EscalationEventDefinition').get('escalationRef') === escalation
            );
          });
        }) || parentScope.element.attachers.find(e => {
          return (
            is(e, 'bpmn:CatchEvent') &&
            isTypedEvent(e, 'bpmn:EscalationEventDefinition') &&
            getEventDefinition(e, 'bpmn:EscalationEventDefinition').get('escalationRef') === escalation
          );
        });

      } while (!triggerElement && (parentScope = parentScope.parent));

      if (!triggerElement) {
        return;
      }

      if (is(triggerElement, 'bpmn:BoundaryEvent')) {
        parentScope = parentScope.parent;
      }

      this._simulator.signal({
        element: triggerElement,
        parentScope
      });
    }
  };

  const entry = Object.entries(behaviors).find(
    entry => isTypedEvent(element, entry[0])
  );

  return entry && entry[1];
};

EventBehaviors.$inject = [
  'simulator',
  'elementRegistry'
];