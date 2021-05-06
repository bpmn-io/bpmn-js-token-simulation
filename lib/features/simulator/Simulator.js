import Ids from 'ids';


export default function Simulator(injector, eventBus) {

  const ids = new Ids();

  // element configuration
  const configuration = {};

  const behaviors = {};

  const scopes = [];

  const noopBehavior = new NoopBehavior();

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

      changed(element);
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

      changed(element);
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

      changed(element);
    });
  }

  function createScope(element, parentScope=null) {

    trace('createScope', element, parentScope);

    const scope = {
      id: ids.next(),
      element,
      tokens: 0,
      tokensByElement: new Map(),
      children: [],
      parent: parentScope,
      updateTokens(element, delta) {
        this.tokens += delta;

        this.tokensByElement.set(
          element,
          this.getTokensByElement(element) + delta
        );
      },
      getTokens() {
        return this.tokens;
      },
      getTokensByElement(element) {
        return this.tokensByElement.get(element) || 0;
      },
      getActiveElements() {
        return Array.from(this.tokensByElement.entries()).filter(e => e[1] > 0).map(e => e[0]);
      }
    };

    if (parentScope) {
      parentScope.children.push(scope);
    }

    scopes.push(scope);

    emit('createScope', {
      scope
    });

    return scope;
  }

  function findScope(filter) {

    const {
      element,
      waitsOnElement,
      parent,
      destroyed
    } = filter;

    return scopes.find(
      scope =>
        (!element || scope.element === element) &&
        (!parent || scope.parent === parent) &&
        (!waitsOnElement || scope.getTokensByElement(waitsOnElement) > 0) &&
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

    for (const element of scope.getActiveElements()) {
      changed(element);
    }

    emit('destroyScope', {
      scope
    });

    scope.destroyed = true;
  }

  function trace(action, element, scope) {
    emit('trace', {
      id: `${action}:${element && element.id || null}:${scope && scope.id || null }`
    });
  }

  function changed(element) {
    emit('elementChanged', {
      element
    });
  }

  function emit(event, payload) {
    return eventBus.fire(`tokenSimulation.simulator.${event}`, payload);
  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  function setConfig(element, config) {
    configuration[element.id || element] = config;

    changed(element);
  }

  function getConfig(element) {
    return configuration[element.id || element] || {};
  }

  function waitAtElement(element, wait=true) {
    const config = getConfig(element) || {};

    setConfig(element, {
      ...config,
      wait
    });
  }

  this.waitAtElement = waitAtElement;

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