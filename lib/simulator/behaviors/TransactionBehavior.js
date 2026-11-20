import {
  ScopeTraits
} from '../ScopeTraits';


const CANCEL_EVENT = {
  type: 'cancel',
  interrupting: true,
  boundary: false,
  persistent: true
};


export default function TransactionBehavior(simulator, compensationBehavior) {
  this._simulator = simulator;
  this._compensationBehavior = compensationBehavior;
}

TransactionBehavior.$inject = [
  'simulator',
  'compensationBehavior'
];

TransactionBehavior.prototype.setup = function(context) {

  const {
    scope
  } = context;

  const cancelSubscription = this._simulator.subscribe(scope, CANCEL_EVENT, (initiator) => {

    cancelSubscription.remove();

    return this.cancel({
      scope,
      initiator
    });
  });

  const compensateEvent = {
    type: 'compensate',
    ref: scope.element,
    persistent: true,
    traits: ScopeTraits.NOT_DEAD
  };

  const compensateSubscription = this._simulator.subscribe(scope, compensateEvent, (initiator) => {

    // need to trigger ordinary
    // transaction cancelation
    if (!scope.canceled) {
      return this._simulator.trigger({
        event: CANCEL_EVENT,
        scope
      });
    }

    compensateSubscription.remove();

    return this._compensationBehavior.compensateScope({
      scope
    });
  });
};

TransactionBehavior.prototype.cancel = function(context) {

  const {
    scope,
    initiator
  } = context;

  // bail out on double cancel
  if (scope.destroyed) {
    return;
  }

  // mark scope as canceled
  scope.cancel(initiator);

  // trigger compensation on element
  this._simulator.trigger({
    event: {
      type: 'compensate',
      ref: scope.element
    },
    initiator,
    scope
  });

  // re-trigger cancel (to trigger boundary cancel events)
  return this._simulator.trigger({
    scope,
    initiator,
    event: CANCEL_EVENT
  });
};
