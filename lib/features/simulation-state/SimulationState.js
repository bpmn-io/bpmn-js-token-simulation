import {
  SCOPE_DESTROYED_EVENT
} from '../../util/EventHelper';

import {
  CheckCircleIcon
} from '../../icons';


export default function SimulationState(
    eventBus,
    simulator,
    elementNotifications) {

  eventBus.on(SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      destroyInitiator,
      element: scopeElement
    } = scope;

    if (!scope.completed || !destroyInitiator) {
      return;
    }

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    elementNotifications.addElementNotification(destroyInitiator.element, {
      type: 'success',
      icon: CheckCircleIcon(),
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