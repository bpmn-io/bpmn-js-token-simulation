import {
  getBusinessObject,
  isEventSubProcess,
} from './ModelUtil';


export default function ScopeBehavior(simulator) {
  this._simulator = simulator;
}

ScopeBehavior.prototype.isFinished = function(scope, excludeScope=null) {
  return scope.children.every(c => c === excludeScope || c.destroyed);
};

ScopeBehavior.prototype.destroyChildren = function(scope, initiator) {

  for (const childScope of scope.children) {

    if (childScope.destroyed) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      reason: 'cancel',
      ...initiator
    });
  }
};

ScopeBehavior.prototype.enter = function(context) {

  const {
    element,
    scope,
    parentScope
  } = context;

  const {
    parent: parentElement
  } = element;

  // trigger event sub-process
  if (isEventSubProcess(parentElement)) {

    if (!parentScope) {
      throw new Error('missing <parentScope>');
    }

    // if we're interrupting, clear all non-interrupting
    // child scopes, remove all tokens and re-add tokens
    // to all interrupting child scopes
    if (isInterrupting(element)) {
      parentScope.interrupting = true;

      this.interrupt(parentScope.parent, {
        element,
        scope
      });
    }
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
      reason: 'cancel',
      ...initiator
    });
  }
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

ScopeBehavior.$inject = [
  'simulator'
];


// helpers ////////////////

function isInterrupting(element) {
  return getBusinessObject(element).isInterrupting;
}