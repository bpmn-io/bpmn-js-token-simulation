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
      destroyContext,
      element: scopeElement
    } = scope;

    const {
      initiator,
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

    elementNotifications.addElementNotification(initiator.element, {
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