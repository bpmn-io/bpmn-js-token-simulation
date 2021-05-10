import Ids from 'ids';


export default function Simulator(injector, eventBus) {

  const ids = new Ids([ 32, 36 ]);

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
      scope = createScope(element.parent, parentScope, element)
    } = context;

    queue(scope, function() {

      trace('signal', {
        ...context,
        scope
      });

      scope.updateTokens(element, 1);

      getBehavior(element).signal({
        element,
        scope
      });

      elementChanged(element);
      scopeChanged(scope);
    });
  }

  function enter(context) {

    const {
      element,
      scope
    } = context;

    queue(scope, function() {
      trace('enter', context);

      scope.updateTokens(element, 1);

      getBehavior(element).enter(context);

      elementChanged(element);
      scopeChanged(scope);
    });
  }

  function exit(context) {

    const {
      element,
      scope
    } = context;

    queue(scope, function() {

      trace('exit', context);

      const consumedTokens = getBehavior(element).exit(context) || 1;

      if (scope) {
        scope.updateTokens(element, -consumedTokens);
      }

      elementChanged(element);
      scopeChanged(scope);
    });
  }

  function createScope(element, parentScope=null, initiator) {

    trace('createScope', {
      element,
      scope: parentScope
    });

    const scope = {
      id: ids.next(),
      element,
      tokens: 0,
      tokensByElement: new Map(),
      children: [],
      initiator,
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

  function scopeFilter(filter) {
    const {
      element,
      waitsOnElement,
      parent,
      destroyed = false
    } = filter;

    return (
      scope =>
        (!element || scope.element === element) &&
        (!parent || scope.parent === parent) &&
        (!waitsOnElement || scope.getTokensByElement(waitsOnElement) > 0) &&
        (destroyed === !!scope.destroyed)
    );
  }

  function findScope(filter) {
    return scopes.find(scopeFilter(filter));
  }

  const noneContext = Object.freeze({
    element: null,
    scope: null,
    reason: 'cancel'
  });

  function destroyScope(scope, context=noneContext) {

    if (scope.destroyed) {
      return;
    }

    [ 'element', 'scope', 'reason' ].forEach(property => {
      if (!(property in context)) {
        throw new Error(`no <context.${property}> provided`);
      }
    });

    for (const childScope of scope.children) {
      if (!childScope.destroyed) {
        destroyScope(childScope, {
          ...context,
          reason: 'cancel'
        });
      }
    }

    trace('destroyScope', {
      element: scope.element,
      scope
    });

    scope.destroyContext = context;

    scope.destroyed = true;

    for (const element of scope.getActiveElements()) {
      elementChanged(element);
    }

    elementChanged(scope.element);

    emit('destroyScope', {
      scope
    });
  }

  function trace(action, context) {

    emit('trace', {
      ...context,
      action
    });
  }

  function elementChanged(element) {
    emit('elementChanged', {
      element
    });
  }

  function scopeChanged(scope) {
    emit('scopeChanged', {
      scope
    });
  }

  function emit(event, payload={}) {
    return eventBus.fire(`tokenSimulation.simulator.${event}`, payload);
  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  function setConfig(element, updatedConfig) {

    const existingConfig = getConfig(element);

    configuration[element.id || element] = {
      ...existingConfig,
      ...updatedConfig
    };

    elementChanged(element);
  }

  function getConfig(element) {
    return configuration[element.id || element] || {};
  }

  function waitAtElement(element, wait=true) {
    setConfig(element, {
      wait
    });
  }

  function reset() {
    for (const scope of scopes) {
      destroyScope(scope);
    }

    scopes.length = 0;

    // TODO(nikku): clear configuration?

    emit('reset');
  }

  this.waitAtElement = waitAtElement;

  this.createScope = createScope;
  this.destroyScope = destroyScope;
  this.findScope = findScope;

  this.scopes = scopes;

  this.setConfig = setConfig;
  this.getConfig = getConfig;

  this.signal = signal;
  this.enter = enter;
  this.exit = exit;

  this.reset = reset;

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