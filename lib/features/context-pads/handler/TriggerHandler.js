import {
  PlayIcon
} from '../../../icons';


export default function TriggerHandler(simulator, translate) {
  this._simulator = simulator;
  this._translate = translate;
}

TriggerHandler.$inject = [
  'simulator',
  'translate'
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
    <button class="bts-context-pad">
      ${PlayIcon()}
    </button>
  `;

  const title = this._translate('Trigger Event');

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
    title,
    contexts
  };
};

TriggerHandler.prototype._findSubscriptions = function(options) {
  return this._simulator.findSubscriptions(options);
};