import {
  is,
  getBusinessObject
} from '../../../util/ElementHelper';

import {
  PlayIcon
} from '../../../icons';


export default function StartEventHandler(simulator) {
  this._simulator = simulator;
}

StartEventHandler.prototype.createContextPads = function(element) {

  const startEvents = findStartEvents(element);

  const pads = startEvents.map(
    startEvent => this.createStartEventContextPad(startEvent, element)
  );

  return pads;
};

StartEventHandler.prototype.createStartEventContextPad = function(element, parent) {

  const parentElement = element.parent;

  let scopes;

  if (is(parentElement, 'bpmn:SubProcess')) {

    if (!isEventSubProcess(parentElement)) {
      return;
    }

    scopes = () => this._findScopes({
      element: parentElement.parent
    });
  }

  const html = `
    <div class="context-pad">
      ${PlayIcon()}
    </div>
  `;

  const action = (scopes) => {
    const parentScope = scopes && scopes[0];

    this._simulator.signal({
      element: parentElement,
      startEvent: element,
      parentScope
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

StartEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

StartEventHandler.$inject = [
  'simulator'
];


// helpers //////////////

function findStartEvents(processElement) {

  const startEvents = processElement.businessObject.triggeredByEvent
    ? []
    : processElement.children.filter(isStartEvent);

  const eventSubProcesses = processElement.children.filter(isEventSubProcess);

  return eventSubProcesses.reduce((startEvents, subProcessElement) => {

    for (const subProcessChild of subProcessElement.children) {
      if (isStartEvent(subProcessChild)) {
        startEvents.push(subProcessChild);
      }
    }

    return startEvents;
  }, startEvents);
}

function isEventSubProcess(element) {
  return getBusinessObject(element).triggeredByEvent;
}

function isStartEvent(element) {
  return is(element, 'bpmn:StartEvent');
}