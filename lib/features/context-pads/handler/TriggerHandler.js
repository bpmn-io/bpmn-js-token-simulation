import {
  PlayIcon
} from '../../../icons';

import { getElementLabel } from '../../../util/ElementHelper';


export default function TriggerHandler(contextPads, simulator) {
  this._simulator = simulator;

  contextPads.register('bpmn:Event', this);
  contextPads.register('bpmn:Activity', this);
}

TriggerHandler.$inject = [
  'contextPads',
  'simulator'
];

TriggerHandler.prototype.createContextPads = function(element) {
  return [
    this.createTriggerContextPad(element)
  ];
};

TriggerHandler.prototype.createTriggerContextPad = function(element) {

  const contexts = () => {
    const subscriptions = this._findSubscriptions({
      element
    });

    const sortedSubscriptions = subscriptions.slice().sort((a, b) => {
      return a.event.type === 'none' ? 1 : -1;
    });

    return sortedSubscriptions;
  };

  const html = `
    <button class="bts-context-pad" title="Trigger Event" aria-label="Trigger Event to: ${ getElementLabel(element) }">
      ${PlayIcon()}
    </button>
  `;

  const action = (subscriptions) => {

    const {
      event,
      scope
    } = subscriptions[0];

    return this._simulator.trigger({
      event,
      scope
    });
  };

  return {
    action,
    element,
    html,
    contexts
  };
};

TriggerHandler.prototype._findSubscriptions = function(options) {
  return this._simulator.findSubscriptions(options);
};