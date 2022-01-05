import {
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

EndEventBehavior.$inject = [
  'simulator',
  'eventBehaviors',
  'scopeBehavior'
];

EndEventBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  for (const outgoing of element.outgoing) {
    if (isMessageFlow(outgoing)) {
      this._simulator.signal({
        element: outgoing
      });
    }
  }

  const eventBehavior = this._eventBehaviors.get(element);

  if (eventBehavior) {
    eventBehavior(context);
  }

  this._simulator.exit(context);
};

EndEventBehavior.prototype.exit = function(context) {

  const {
    scope
  } = context;

  this._scopeBehavior.tryExit(scope.parent, scope);
};