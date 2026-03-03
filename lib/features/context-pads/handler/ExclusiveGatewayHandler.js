import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  ForkIcon
} from '../../../icons';

import { getElementLabel } from '../../../util/ElementHelper';


export default function ExclusiveGatewayHandler(contextPads, exclusiveGatewaySettings) {
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;

  contextPads.register('bpmn:ExclusiveGateway', this);
}

ExclusiveGatewayHandler.prototype.createContextPads = function(element) {

  const outgoingFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (outgoingFlows.length < 2) {
    return;
  }

  const label = `Set Sequence Flow to: ${ getElementLabel(element) }`;

  const html = `
    <button class="bts-context-pad" title="Set Sequence Flow" aria-label="${ label }">
      ${ForkIcon()}
    </button>
  `;

  const action = () => {
    this._exclusiveGatewaySettings.setSequenceFlow(element);
  };

  return [
    {
      action,
      element,
      html
    }
  ];
};

ExclusiveGatewayHandler.$inject = [
  'contextPads',
  'exclusiveGatewaySettings'
];