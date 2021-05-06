import Ids from 'ids';


export default function Simulator(injector, eventBus) {

  const ids = new Ids();

  // element configuration
  const configuration = {};

  const behaviors = {};

  const scopes = [];

  const noopBehavior = new NoopBehavior();


  function createScope(element, parentScope) {

    trace('createScope', element, parentScope);

    const scope = {
      id: ids.next(),
      element,
      tokens: 0,
      tokensByElement: {},
      children: [],
      parent: parentScope,
      updateTokens(element, delta) {
        this.tokens += delta;
        this.tokensByElement[element.id] = (this.tokensByElement[element.id] || 0) + delta;
      },
      getTokens() {
        return this.tokens;
      },
      getTokensByElement(element) {
        return (this.tokensByElement[element.id] || 0);
      }
    };

    if (parentScope) {
      parentScope.children.push(scope);
    }

    scopes.push(scope);

    return scope;
  }

  const jobs = [];

  function queue(scope, task) {

    // add this task
    jobs.push([ task, scope ]);

    if (jobs.length !== 1) {
      return;
    }

    let next;

    while ((next = jobs[0])) {

      const [ task, scope ] = next;

      if (!scope.destroyed) {
        task();
      }

      // remove first task
      jobs.shift();
    }
  }

  function getBehavior(element) {
    return behaviors[element.type] || noopBehavior;
  }

  function signal(context) {

    const {
      element,
      parentScope
    } = context;

    const {
      scope = createScope(element.parent, parentScope)
    } = context;

    queue(scope, function() {

      trace('signal', element, scope);

      scope.updateTokens(element, 1);

      getBehavior(element).signal({
        element,
        scope
      });
    });
  }

  function enter(context) {

    const {
      element,
      scope
    } = context;

    queue(scope, function() {
      trace('enter', element, scope);

      scope.updateTokens(element, 1);

      getBehavior(element).enter(context);
    });
  }

  function exit(context) {

    const {
      element,
      scope
    } = context;

    queue(scope, function() {

      trace('exit', element, scope);

      const consumedTokens = getBehavior(element).exit(context) || 1;

      if (scope) {
        scope.updateTokens(element, -consumedTokens);
      }
    });
  }

  function findScope(filter) {

    const {
      element,
      parent,
      destroyed
    } = filter;

    return scopes.find(
      scope =>
        (!element || scope.element === element) &&
        (!parent || scope.parent === parent) &&
        (!scope.destroyed || destroyed)
    );
  }

  function destroyScope(scope) {

    for (const childScope of scope.children) {
      if (!childScope.destroyed) {
        destroyScope(childScope);
      }
    }

    trace('destroyScope', scope.element, scope);

    scope.destroyed = true;
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
  this.findScope = findScope;

  this.setConfig = setConfig;
  this.getConfig = getConfig;

  this.signal = signal;
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

  this.signal = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.exit = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.enter = function(context) {
    console.log('ignored #enter', context.element);
  };

}