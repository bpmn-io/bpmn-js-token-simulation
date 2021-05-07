import randomColor from 'randomcolor';

import {
  SCOPE_CREATE_EVENT
} from '../../util/EventHelper';

const HIGH_PRIORITY = 1500;


export default function ColoredScopes(eventBus) {

  const colors = randomColor({
    count: 30
  });

  let colorsIdx = 0;

  function getColor(scope) {
    const {
      initiator
    } = scope;

    if (initiator && initiator.type === 'bpmn:MessageFlow') {
      return '#999';
    }

    if (scope.parent) {
      return scope.parent.color;
    }

    return colors[ (colorsIdx++) % colors.length ];
  }

  eventBus.on(SCOPE_CREATE_EVENT, HIGH_PRIORITY, event => {

    const {
      scope
    } = event;

    scope.color = getColor(scope);
  });
}

ColoredScopes.$inject = [
  'eventBus'
];