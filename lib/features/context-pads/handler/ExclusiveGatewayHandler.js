import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function ExclusiveGatewayHandler(simulator) {
  this._simulator = simulator;
}

ExclusiveGatewayHandler.prototype.createContextPads = function(element) {

  const outgoingFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (outgoingFlows.length < 2) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Set Sequence Flow"><i class="fa fa-code-fork"></i></div>'
  );

  domEvent.bind(html, 'click', () => {

    const {
      activeOutgoing,
      ...rest
    } = this._simulator.getConfig(element);

    const idx = outgoingFlows.indexOf(activeOutgoing);

    this._simulator.setConfig(element, {
      ...rest,
      activeOutgoing: outgoingFlows[(idx + 1) % outgoingFlows.length]
    });
  });

  return [
    {
      element,
      html
    }
  ];
};

ExclusiveGatewayHandler.$inject = [
  'simulator'
];