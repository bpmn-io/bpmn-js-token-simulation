export default function ScopeBehavior(simulator) {
  this._simulator = simulator;
}

ScopeBehavior.$inject = [
  'simulator'
];

/**
 * Is the given scope finished?
 *
 * @param {Scope}  scope
 * @param {Scope|Function} [excludeScope=null]
 *
 * @return {boolean}
 */
ScopeBehavior.prototype.isFinished = function(scope, excludeScope=null) {

  excludeScope = matchScope(excludeScope);

  return scope.children.every(c => c.destroyed || excludeScope(c));
};

/**
 * Destroy all scope children.
 *
 * @param {Scope} scope
 * @param {Scope} initiator
 * @param {Scope|Function} [excludeScope=null]
 */
ScopeBehavior.prototype.destroyChildren = function(scope, initiator, excludeScope=null) {

  excludeScope = matchScope(excludeScope);

  scope.children.filter(c => !c.destroyed && !excludeScope(c)).map(c => {
    this._simulator.destroyScope(c, initiator);
  });
};

ScopeBehavior.prototype.terminate = function(scope, initiator) {

  // kill all child scopes
  this.destroyChildren(scope, initiator);

  // mark as terminated
  scope.terminate(initiator);

  // exit immediately
  this.tryExit(scope, initiator);
};

ScopeBehavior.prototype.interrupt = function(scope, initiator) {

  // kill children but initiator
  this.destroyChildren(scope, initiator, initiator);

  // mark as failed
  scope.fail(initiator);
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


// helpers ////////////////

/**
 * Create a scope matcher.
 *
 * @param {Scope|Function} fnOrScope
 *
 * @return { (Scope) => boolean }
 */
function matchScope(fnOrScope) {

  if (typeof fnOrScope === 'function') {
    return fnOrScope;
  }

  return (scope) => scope === fnOrScope;
}