import {
  isTerminate,
  isMessageFlow
} from './ModelUtil';


export default function EndEventBehavior(
    simulator,
    eventBehaviors,
    scopeBehavior) {

  this._simulator = simulator;
  this._eventBehaviors = eventBehaviors;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:EndEvent', this);
}

EndEventBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const eventBehavior = this._eventBehaviors.get(element);

  if (eventBehavior) {
    eventBehavior(context);
  }

  for (const outgoing of element.outgoing) {
    if (isMessageFlow(outgoing)) {
      this._simulator.signal({
        element: outgoing
      });
    }
  }

  this._simulator.exit(context);
};

EndEventBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  const initiator = {
    element,
    scope
  };

  const {
    parent: parentScope
  } = scope;

  if (isTerminate(element)) {
    this._scopeBehavior.terminate(parentScope, initiator);
  }

  this._scopeBehavior.tryExit(parentScope, initiator);
};

EndEventBehavior.$inject = [
  'simulator',
  'eventBehaviors',
  'scopeBehavior'
];