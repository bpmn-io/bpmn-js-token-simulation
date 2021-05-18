import {
  is
} from './ModelUtil';


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

SubProcessBehavior.prototype.signal = function(context) {
  this.enter(context);
};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element,
    startEvent = findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope
  });
};

SubProcessBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  this._activityBehavior.exit(context);

  const {
    parent: scopeParent
  } = scope;

  if (this._scopeBehavior.isFinished(scopeParent, scope)) {
    this._scopeBehavior.exit({
      scope: scopeParent,
      initiator
    });
  }
};

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];


// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}