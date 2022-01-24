import {
  ScopeTraits
} from './ScopeTraits';

const SELF = {};

function illegalTransition(state, target) {
  throw new Error(`illegal transition: ${state.name} -> ${target}`);
}

function orSelf(state, self) {
  if (state === SELF) {
    return self;
  }

  return state;
}

/**
 * A representation of a scopes state with name, traits, and supported
 * transitions to other states.
 */
export class ScopeState {

  /**
   * @param {string} name
   * @param {number} traits
   * @param {object} [transitions]
   * @param {ScopeState} [transitions.start]
   * @param {ScopeState} [transitions.cancel]
   * @param {ScopeState} [transitions.complete]
   * @param {ScopeState} [transitions.destroy]
   * @param {ScopeState} [transitions.fail]
   * @param {ScopeState} [transitions.terminate]
   * @param {ScopeState} [transitions.compensable]
   */
  constructor(name, traits, {
    start,
    cancel,
    complete,
    destroy,
    fail,
    terminate,
    compensable
  } = {}) {
    this.name = name;

    /**
     * A bit-wise encoded set of traits
     * characterizing the scope.
     *
     * @type {number}
     */
    this.traits = traits;

    this._start = orSelf(start, this);
    this._compensable = orSelf(compensable, this);
    this._cancel = orSelf(cancel, this);
    this._complete = orSelf(complete, this);
    this._destroy = orSelf(destroy, this);
    this._fail = orSelf(fail, this);
    this._terminate = orSelf(terminate, this);
  }

  /**
   * @param {number} trait
   * @return {boolean}
   */
  hasTrait(trait) {
    return (this.traits & trait) !== 0;
  }

  /**
   * @return {ScopeState}
   */
  complete() {
    return this._complete || illegalTransition(this, 'complete');
  }

  /**
   * @return {ScopeState}
   */
  destroy() {
    return this._destroy || illegalTransition(this, 'destroy');
  }

  /**
   * @return {ScopeState}
   */
  cancel() {
    return this._cancel || illegalTransition(this, 'cancel');
  }

  /**
   * @return {ScopeState}
   */
  fail() {
    return this._fail || illegalTransition(this, 'fail');
  }

  /**
   * @return {ScopeState}
   */
  terminate() {
    return this._terminate || illegalTransition(this, 'terminate');
  }

  /**
   * @return {ScopeState}
   */
  compensable() {
    return this._compensable || illegalTransition(this, 'compensable');
  }

  /**
   * @return {ScopeState}
   */
  start() {
    return this._start || illegalTransition(this, 'start');
  }
}

const FAILED = new ScopeState('failed', ScopeTraits.DESTROYED | ScopeTraits.FAILED);

const TERMINATED = new ScopeState('terminated', ScopeTraits.DESTROYED | ScopeTraits.TERMINATED);

const COMPLETED = new ScopeState('completed', ScopeTraits.DESTROYED | ScopeTraits.COMPLETED);

const TERMINATING = new ScopeState('terminating', ScopeTraits.ENDING | ScopeTraits.TERMINATED, {
  destroy: TERMINATED
});

const CANCELING = new ScopeState('canceling', ScopeTraits.ENDING | ScopeTraits.FAILED | ScopeTraits.CANCELED, {
  destroy: FAILED,
  complete: SELF,
  terminate: TERMINATING
});

const COMPLETING = new ScopeState('completing', ScopeTraits.ENDING | ScopeTraits.COMPLETED, {
  destroy: COMPLETED,
  cancel: CANCELING,
  terminate: TERMINATING
});

const FAILING = new ScopeState('failing', ScopeTraits.ENDING | ScopeTraits.FAILED, {
  cancel: CANCELING,
  complete: COMPLETING,
  destroy: FAILED,
  terminate: TERMINATING
});

const COMPENSABLE_FAILING = new ScopeState('compensable:failing', ScopeTraits.ENDING | ScopeTraits.FAILED, {
  complete: SELF,
  terminate: TERMINATING,
  destroy: FAILED
});

const COMPENSABLE_COMPLETED = new ScopeState('compensable:completed', ScopeTraits.ENDED | ScopeTraits.COMPLETED, {
  cancel: CANCELING,
  fail: COMPENSABLE_FAILING,
  destroy: COMPLETED,
  compensable: SELF
});

const COMPENSABLE_COMPLETING = new ScopeState('compensable:completing', ScopeTraits.ENDING | ScopeTraits.COMPLETED, {
  destroy: COMPENSABLE_COMPLETED,
  terminate: TERMINATING,
  compensable: SELF
});

const COMPENSABLE_RUNNING = new ScopeState('compensable:running', ScopeTraits.RUNNING | ScopeTraits.COMPENSABLE, {
  cancel: CANCELING,
  complete: COMPENSABLE_COMPLETING,
  compensable: SELF,
  destroy: COMPENSABLE_COMPLETED,
  fail: FAILING,
  terminate: TERMINATING
});

const RUNNING = new ScopeState('running', ScopeTraits.RUNNING, {
  cancel: CANCELING,
  complete: COMPLETING,
  compensable: COMPENSABLE_RUNNING,
  destroy: TERMINATED,
  fail: FAILING,
  terminate: TERMINATING
});

const ACTIVATED = new ScopeState('activated', ScopeTraits.ACTIVATED, {
  start: RUNNING,
  destroy: TERMINATED
});

export const ScopeStates = Object.freeze({
  ACTIVATED,
  RUNNING,
  CANCELING,
  COMPLETING,
  COMPLETED,
  FAILING,
  FAILED,
  TERMINATING,
  TERMINATED,
});