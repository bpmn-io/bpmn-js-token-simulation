import {
  ForkIcon
} from '../../../icons';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isSequenceFlow } from '../../../simulator/util/ModelUtil';

export default function InclusiveGatewayHandler(inclusiveGatewaySettings, translate) {
  this._inclusiveGatewaySettings = inclusiveGatewaySettings;
  this._translate = translate;
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
    <button class="bts-context-pad">
      ${ForkIcon()}
    </button>
  `;

  const title = this._translate('Set Sequence Flow');

  return nonDefaultFlows.map(sequenceFlow => {
    const action = () => {
      this._inclusiveGatewaySettings.toggleSequenceFlow(element, sequenceFlow);
    };

    return {
      action,
      element: sequenceFlow,
      html,
      title
    };
  });
};

InclusiveGatewayHandler.$inject = [
  'inclusiveGatewaySettings',
  'translate'
];