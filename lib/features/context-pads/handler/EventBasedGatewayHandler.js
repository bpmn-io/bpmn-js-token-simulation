import {
  domify
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function EventBasedGatewayHandler(simulator) {
  this._simulator = simulator;
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

  const scopes = () => {
    return this._findScopes({
      element: scopeElement
    });
  };

  if (!scopes().length) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  const action = (scopes) => {
    this._simulator.signal({
      element: element,
      scope: scopes[0]
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

EventBasedGatewayHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

EventBasedGatewayHandler.$inject = [
  'simulator'
];