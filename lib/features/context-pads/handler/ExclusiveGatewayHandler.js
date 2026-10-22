import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  ForkIcon
} from '../../../icons';


export default function ExclusiveGatewayHandler(exclusiveGatewaySettings, translate) {
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;
  this._translate = translate;
}

ExclusiveGatewayHandler.prototype.createContextPads = function(element) {

  const outgoingFlows = element.outgoing.filter(function(outgoing) {
    return is(outgoing, 'bpmn:SequenceFlow');
  });

  if (outgoingFlows.length < 2) {
    return;
  }

  const html = `
    <button class="bts-context-pad">
      ${ForkIcon()}
    </button>
  `;

  const title = this._translate('Set Sequence Flow');

  const action = () => {
    this._exclusiveGatewaySettings.setSequenceFlow(element);
  };

  return [
    {
      action,
      element,
      html,
      title
    }
  ];
};

ExclusiveGatewayHandler.$inject = [
  'exclusiveGatewaySettings',
  'translate'
];