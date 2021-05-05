import Ids from 'ids';

export default function Simulator(eventBus) {

  const ids = new Ids();

  // element configuration
  const configuration = {};

  const rootScope = createScope('__root');

  function createScope(elementId) {

    return {
      id: ids.next(),
      elementId,
      tokens: [],
      children: []
    };
  }

  function signal(activityId, tokenId) {

    // TODO(nikku): implement
    //   * extract element type
    //   * execute element behavior
  }

  function take(transitionId, tokenId) {

  }

  function findScope(elementId, scopeId) {

  }

  function destroyScope(scope) {

  }

  function trace(action, id) {

  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  this.configure = function(elementId, configuration) {
    this.configuration[elementId] = configuration;
  };

  this.signal = signal;

  this.on = on;
  this.off = off;
}

Simulator.$inject = [ 'eventBus' ];