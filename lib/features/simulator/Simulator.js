import Ids from 'ids';


export default function Simulator(injector, eventBus) {

  const ids = new Ids();

  // element configuration
  const configuration = {};

  const behaviors = {};

  const noopBehavior = new NoopBehavior();

  const rootScope = createScope({ id: '__root' }, null);

  function createScope(element, parentScope) {

    trace('createScope', element, parentScope);

    return {
      id: ids.next(),
      element,
      tokens: 0,
      tokensByElement: {},
      children: [],
      parent: parentScope
    };
  }

  const tasks = [];

  function queue(task) {

    // add this task
    tasks.push(task);

    if (tasks.length !== 1) {
      return;
    }

    while ((task = tasks[0])) {

      task();

      // remove first task
      tasks.shift();
    }
  }

  function enter(context) {

    queue(function() {
      const {
        element,
        scope
      } = context;

      const behavior = behaviors[element.type] || noopBehavior;

      trace('enter', element, scope);

      updateTokens(scope, element, 1);

      behavior.enter({
        element,
        scope
      });
    });
  }

  function exit(context) {

    queue(function() {
      const {
        element,
        scope
      } = context;

      const behavior = behaviors[element.type] || noopBehavior;

      trace('exit', element, scope);

      const consumedTokens = behavior.exit({
        element,
        scope
      }) || 1;

      if (scope) {
        updateTokens(scope, element, -consumedTokens);
      }
    });
  }

  function updateTokens(scope, element, delta) {
    scope.tokens += delta;
    scope.tokensByElement[element.id] = (scope.tokensByElement[element.id] || 0) + delta;
  }

  function destroyScope(scope) {
    trace('destroyScope', scope.element, scope);
  }

  function trace(action, element, scope) {
    eventBus.fire('tokenSimulation.simulator.trace', {
      id: `${action}:${element && element.id || null}:${scope && scope.id || null }`
    });
  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  function setConfig(element, config) {
    configuration[element.id || element] = config;
  }

  function getConfig(element) {
    return configuration[element.id || element];
  }

  this.createScope = createScope;
  this.destroyScope = destroyScope;

  this.setConfig = setConfig;
  this.getConfig = getConfig;

  this.enter = enter;
  this.exit = exit;

  this.on = on;
  this.off = off;

  this.registerBehavior = function(element, behavior) {
    behaviors[element] = behavior;
  };
}

Simulator.$inject = [ 'injector', 'eventBus' ];


// helpers /////////////////

function NoopBehavior() {

  this.exit = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.enter = function(context) {
    console.log('ignored #enter', context.element);
  };

}