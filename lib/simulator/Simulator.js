import Ids from 'ids';


export default function Simulator(injector, eventBus) {

  const ids = new Ids([ 32, 36 ]);

  // element configuration
  const configuration = {};

  const behaviors = {};

  const scopes = [];

  const noopBehavior = new NoopBehavior();

  const jobs = [];

  const changedElements = new Set();


  on('tick', function() {
    for (const element of changedElements) {
      emit('elementChanged', {
        element
      });
    }

    changedElements.clear();
  });

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

    emit('tick');
  }

  function getBehavior(element) {
    return behaviors[element.type] || noopBehavior;
  }

  function signal(context) {

    const {
      element,
      parentScope
    } = context;

    const scope = context.scope || createScope(element, parentScope, element);

    queue(scope, function() {

      trace('signal', {
        ...context,
        scope
      });

      getBehavior(element).signal({
        ...context,
        scope
      });

      if (scope.parent) {
        scopeChanged(scope.parent);
      }
    });
  }

  function enter(context) {

    const {
      element,
      scope: parentScope
    } = context;

    const scope = createScope(element, parentScope, element);

    queue(scope, function() {
      trace('enter', context);

      getBehavior(element).enter({
        ...context,
        scope
      });

      scopeChanged(parentScope);
    });
  }

  function exit(context) {

    const {
      element,
      scope,
      initiator = {
        element,
        scope
      }
    } = context;

    queue(scope, function() {

      trace('exit', context);

      getBehavior(element).exit(context);

      destroyScope(scope, {
        ...initiator,
        reason: 'complete'
      });

      scope.parent && scopeChanged(scope.parent);
    });
  }

  function createScope(element, parentScope=null, initiator=null) {

    trace('createScope', {
      element,
      scope: parentScope
    });

    const scope = {
      id: ids.next(),
      element,
      children: [],
      interrupted: false,
      destroyed: false,
      initiator,
      parent: parentScope,
      getTokens() {
        return this.children.filter(c => !c.destroyed).length;
      },
      getTokensByElement(element) {
        return this.children.filter(c => !c.destroyed && c.element === element).length;
      }
    };

    if (parentScope) {
      parentScope.children.push(scope);
    }

    scopes.push(scope);

    emit('createScope', {
      scope
    });

    elementChanged(element);

    return scope;
  }

  function scopeFilter(filter) {

    if (typeof filter === 'function') {
      return filter;
    }

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

  function findScopes(filter) {
    return scopes.filter(scopeFilter(filter));
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
    changedElements.add(element);
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

    emit('tick');
    emit('reset');
  }

  this.waitAtElement = waitAtElement;

  this.createScope = createScope;
  this.destroyScope = destroyScope;

  this.findScope = findScope;
  this.findScopes = findScopes;

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