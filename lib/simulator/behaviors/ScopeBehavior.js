export default function ScopeBehavior(simulator) {
  this._simulator = simulator;
}

ScopeBehavior.$inject = [
  'simulator'
];


ScopeBehavior.prototype.isFinished = function(scope, excludeScope=null) {
  return scope.children.every(c => c === excludeScope || c.destroyed);
};

ScopeBehavior.prototype.destroyChildren = function(scope, initiator) {

  for (const childScope of scope.children) {

    if (childScope.destroyed) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      initiator,
      reason: 'cancel'
    });
  }
};

ScopeBehavior.prototype.terminate = function(scope, initiator) {

  // mark as interrupted
  scope.interrupted = true;

  // kill all but initiating child scopes
  for (const childScope of scope.children) {

    if (childScope.destroyed || childScope === initiator) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      initiator,
      reason: 'cancel'
    });
  }
};

ScopeBehavior.prototype.interrupt = function(scope, initiator) {

  // mark as interrupted
  scope.interrupted = true;

  // kill non-interrupting child scopes
  for (const childScope of scope.children) {

    if (childScope.destroyed || childScope.interrupting) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      initiator,
      reason: 'cancel',
    });
  }
};

ScopeBehavior.prototype.tryExit = function(scope, initiator) {
  if (!scope) {
    throw new Error('missing <scope>');
  }

  if (!initiator) {
    initiator = scope;
  }

  if (!this.isFinished(scope, initiator)) {
    return;
  }

  this.exit({
    scope,
    initiator
  });
};

ScopeBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  if (!initiator) {
    throw new Error('missing <initiator>');
  }

  this._simulator.exit({
    element: scope.element,
    scope: scope,
    initiator
  });
};