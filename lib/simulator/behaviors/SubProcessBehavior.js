import {
  is,
  isEventSubProcess,
  isInterrupting
} from '../util/ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];

SubProcessBehavior.prototype.signal = function(context) {
  this._start(context);
};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const wait = this._waitsAtElement(element);

  if (wait) {
    return this._subscribe(context, {
      element,
      type: 'pause',
      interrupting: false,
      boundary: false
    });
  }

  this._start(context);
};

SubProcessBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

SubProcessBehavior.prototype._start = function(context) {
  const {
    element,
    startEvent = findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  const targetScope = scope.parent;

  if (!targetScope.running) {
    throw new Error(`target scope <${targetScope.id}> not running`);
  }

  const cancelActivity = isEventSubProcess(element) && isInterrupting(startEvent);

  if (cancelActivity) {
    this._scopeBehavior.interrupt(targetScope, scope);
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope,
    initiator: scope
  });
};

SubProcessBehavior.prototype._waitsAtElement = function(element) {
  return this._simulator.getConfig(element).wait;
};

SubProcessBehavior.prototype._subscribe = function(context, event) {

  const {
    scope,
    element
  } = context;

  const subscription = this._simulator.subscribe(scope, event, initiator => {

    subscription.remove();

    return this._simulator.signal({
      scope,
      element,
      initiator
    });
  });
};

// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}