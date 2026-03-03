import {
  ForkIcon
} from '../../../icons';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isSequenceFlow } from '../../../simulator/util/ModelUtil';

import { getElementLabel } from '../../../util/ElementHelper';

export default function InclusiveGatewayHandler(contextPads, inclusiveGatewaySettings) {
  this._inclusiveGatewaySettings = inclusiveGatewaySettings;

  contextPads.register('bpmn:InclusiveGateway', this);
}

InclusiveGatewayHandler.prototype.createContextPads = function(element) {
  const outgoingFlows = element.outgoing.filter(isSequenceFlow);

  if (outgoingFlows.length < 2) {
    return;
  }

  const nonDefaultFlows = outgoingFlows.filter(outgoing => {
    const flowBo = getBusinessObject(outgoing),
          gatewayBo = getBusinessObject(element);

    return gatewayBo.default !== flowBo;
  });

  const label = `Set Sequence Flow to: ${ getElementLabel(element) }`;

  const html = `
    <button class="bts-context-pad" title="Set Sequence Flow" aria-label="${ label }">
      ${ForkIcon()}
    </button>
  `;

  return nonDefaultFlows.map(sequenceFlow => {
    const action = () => {
      this._inclusiveGatewaySettings.toggleSequenceFlow(element, sequenceFlow);
    };

    return {
      action,
      element: sequenceFlow,
      html
    };
  });
};

InclusiveGatewayHandler.$inject = [
  'contextPads',
  'inclusiveGatewaySettings'
];