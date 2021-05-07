import {
  SCOPE_DESTROYED_EVENT
} from '../../util/EventHelper';


export default function SimulationState(
    eventBus,
    simulator,
    elementNotifications) {

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      destroyContext,
      element: scopeElement
    } = scope;

    const {
      element,
      reason
    } = destroyContext;

    if (reason !== 'complete') {
      return;
    }

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    elementNotifications.addElementNotification(element, {
      type: 'success',
      icon: 'fa-check-circle',
      text: 'Finished',
      scope
    });
  });
}

SimulationState.$inject = [
  'eventBus',
  'simulator',
  'elementNotifications'
];