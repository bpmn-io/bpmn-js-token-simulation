import {
  ForkIcon
} from '../../../icons';

import { getBusinessObject } from '../../../util/ElementHelper';
import { isSequenceFlow } from '../../../simulator/util/ModelUtil';

export default function InclusiveGatewayHandler(inclusiveGatewaySettings) {
  this._inclusiveGatewaySettings = inclusiveGatewaySettings;
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

  const html = `
    <div class="bts-context-pad" title="Set Sequence Flow">
      ${ForkIcon()}
    </div>
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
  'inclusiveGatewaySettings'
];