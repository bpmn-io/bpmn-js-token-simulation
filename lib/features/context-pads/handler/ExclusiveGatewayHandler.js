import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function ExclusiveGatewayHandler(exclusiveGatewaySettings) {
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;
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
    this._exclusiveGatewaySettings.setSequenceFlow(element);
  });

  return [
    {
      element,
      html
    }
  ];
};

ExclusiveGatewayHandler.$inject = [
  'exclusiveGatewaySettings'
];