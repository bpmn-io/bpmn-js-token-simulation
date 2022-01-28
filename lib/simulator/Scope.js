import { ScopeTraits } from './ScopeTraits';
import { ScopeStates } from './ScopeStates';


/**
 * A representation of anything runnable in token simulation land.
 */
export default class Scope {

  /**
   * @param {string} id
   * @param {Element} element
   * @param {Scope} parent
   * @param {Scope} initiator
   *
   * @constructor
   */
  constructor(id, element, parent = null, initiator = null) {
    this.id = id;
    this.element = element;
    this.parent = parent;
    this.initiator = initiator;

    this.subscriptions = new Set();

    this.children = [];
    this.state = ScopeStates.ACTIVATED;
  }

  /**
   * @return {boolean}
   */
  get running() {
    return this.hasTrait(ScopeTraits.RUNNING);
  }

  /**
   * @return {boolean}
   */
  get destroyed() {
    return this.hasTrait(ScopeTraits.DESTROYED);
  }

  /**
   * @return {boolean}
   */
  get completed() {
    return this.hasTrait(ScopeTraits.COMPLETED);
  }

  /**
   * @return {boolean}
   */
  get canceled() {
    return this.hasTrait(ScopeTraits.CANCELED);
  }

  /**
   * @return {boolean}
   */
  get failed() {
    return this.hasTrait(ScopeTraits.FAILED);
  }

  /**
   * @param {number} phase
   * @return {boolean}
   */
  hasTrait(trait) {
    return this.state.hasTrait(trait);
  }

  /**
   * Start the scope
   *
   * @return {Scope}
   */
  start() {
    this.state = this.state.start();

    return this;
  }

  /**
   * Make this scope compensable.
   *
   * @return {Scope}
   */
  compensable() {
    this.state = this.state.compensable();

    return this;
  }

  /**
   * @param {Scope} initiator
   *
   * @return {Scope}
   */
  fail(initiator) {
    if (!this.failed) {
      this.state = this.state.fail();

      this.failInitiator = initiator;
    }

    return this;
  }

  cancel(initiator) {

    if (!this.canceled) {
      this.state = this.state.cancel();

      this.cancelInitiator = initiator;
    }

    return this;
  }

  /**
   * @param {Scope} initiator
   *
   * @return {Scope}
   */
  terminate(initiator) {
    this.state = this.state.terminate();

    this.terminateInitiator = initiator;

    return this;
  }

  /**
   * @return {Scope}
   */
  complete() {
    this.state = this.state.complete();

    return this;
  }

  /**
   * Destroy the scope
   *
   * @param {Scope} initiator
   *
   * @return {Scope}
   */
  destroy(initiator) {
    this.state = this.state.destroy();

    this.destroyInitiator = initiator;

    return this;
  }

  /**
   * @return {number}
   */
  getTokens() {
    return this.children.filter(c => !c.destroyed).length;
  }

  /**
   * @param {Element} element
   *
   * @return {number}
   */
  getTokensByElement(element) {
    return this.children.filter(c => !c.destroyed && c.element === element).length;
  }

}