const ACTIVATED = 1;
const RUNNING = 1 << 1;
const ENDING = 1 << 2;
const ENDED = 1 << 3;
const DESTROYED = 1 << 4;
const FAILED = 1 << 5;
const TERMINATED = 1 << 6;
const CANCELED = 1 << 7;
const COMPLETED = 1 << 8;
const COMPENSABLE = 1 << 9;

const ACTIVE = ACTIVATED | RUNNING | ENDING;
const NOT_DEAD = ACTIVATED | ENDED;

export const ScopeTraits = Object.freeze({
  ACTIVATED,
  RUNNING,
  ENDING,
  ENDED,
  DESTROYED,
  FAILED,
  TERMINATED,
  CANCELED,
  COMPLETED,
  COMPENSABLE,
  ACTIVE,
  NOT_DEAD
});