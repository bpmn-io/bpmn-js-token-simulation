import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function EventBasedGatewayHandler(simulator, scopeFilter) {
  this._simulator = simulator;
  this._scopeFilter = scopeFilter;
}

EventBasedGatewayHandler.prototype.createContextPads = function(element) {
  const catchEvents = (
    element.outgoing.filter(
      outgoing => is(outgoing, 'bpmn:SequenceFlow')
    ).map(
      outgoing => outgoing.target
    ).filter(
      element => is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:ReceiveTask')
    )
  );

  return catchEvents.map(
    element => this.createCatchEventPad(element)
  );
};

EventBasedGatewayHandler.prototype.createCatchEventPad = function(element) {

  const scopeElement = element.incoming.map(
    connection => connection.source
  ).find(
    element => is(element, 'bpmn:EventBasedGateway')
  );

  if (!scopeElement) {
    return;
  }

  // need waiting scope on other elements
  const waitingScope = this._findScope({
    waitsOnElement: scopeElement
  });

  if (!waitingScope) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element: element,
      relatedElement: scopeElement,
      scope: this._findScope({
        waitsOnElement: scopeElement
      })
    });
  });

  return {
    element,
    html
  };
};

EventBasedGatewayHandler.prototype._findScope = function(options) {
  return (
    this._scopeFilter.findScope(options) ||
    this._simulator.findScope(options)
  );
};

EventBasedGatewayHandler.$inject = [
  'simulator',
  'scopeFilter'
];