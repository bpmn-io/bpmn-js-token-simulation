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
   * @param {ScopeState} [transitions.complete]
   * @param {ScopeState} [transitions.destroy]
   * @param {ScopeState} [transitions.fail]
   * @param {ScopeState} [transitions.terminate]
   */
  constructor(name, traits, {
    start,
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

const FAILING = new ScopeState('failing', ScopeTraits.ENDING | ScopeTraits.FAILED, {
  destroy: FAILED,
  terminate: TERMINATING,
  complete: COMPLETING
});

const RUNNING = new ScopeState('running', ScopeTraits.RUNNING, {
  fail: FAILING,
  destroy: TERMINATED,
  terminate: TERMINATING,
  complete: COMPLETING
});

const ACTIVATED = new ScopeState('activated', ScopeTraits.ACTIVATED, {
  start: RUNNING,
  destroy: TERMINATED
});

export const ScopeStates = Object.freeze({
  ACTIVATED,
  RUNNING,
  COMPLETING,
  FAILING,
  TERMINATING,
  FAILED,
  TERMINATED,
  COMPLETED
});