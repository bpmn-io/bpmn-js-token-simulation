import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is,
  getBusinessObject
} from '../../../util/ElementHelper';


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

  let parentScope;

  if (is(parentElement, 'bpmn:SubProcess')) {

    if (!isEventSubProcess(parentElement)) {
      return;
    }

    parentScope = this._simulator.findScope({
      element: parentElement.parent
    });

    // no parent scope for event sub-process
    if (!parentScope) {
      return;
    }
  }

  const html = domify(
    '<div class="context-pad"><i class="fa fa-play"></i></div>'
  );

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element,
      parentScope
    });
  });

  return {
    element,
    html
  };
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