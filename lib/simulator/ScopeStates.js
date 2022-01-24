import {
  ScopeTraits
} from './ScopeTraits';


function illegalTransition(state, target) {
  throw new Error(`illegal transition: ${state.name} -> ${target}`);
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
   */
  constructor(name, traits, {
    start,
    cancel,
    complete,
    destroy,
    fail,
    terminate
  } = {}) {
    this.name = name;

    /**
     * A bit-wise encoded set of traits
     * characterizing the scope.
     *
     * @type {number}
     */
    this.traits = traits;

    this._start = start;
    this._cancel = cancel;
    this._complete = complete;
    this._destroy = destroy;
    this._fail = fail;
    this._terminate = terminate;
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

const COMPLETING = new ScopeState('completing', ScopeTraits.ENDING | ScopeTraits.COMPLETED, {
  destroy: COMPLETED,
  terminate: TERMINATING
});

const CANCELING = new ScopeState('canceling', ScopeTraits.ENDING | ScopeTraits.FAILED | ScopeTraits.CANCELED, {
  destroy: FAILED,
  terminate: TERMINATING
});

const FAILING = new ScopeState('failing', ScopeTraits.ENDING | ScopeTraits.FAILED, {
  cancel: CANCELING,
  complete: COMPLETING,
  destroy: FAILED,
  terminate: TERMINATING
});

const RUNNING = new ScopeState('running', ScopeTraits.RUNNING, {
  cancel: CANCELING,
  complete: COMPLETING,
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