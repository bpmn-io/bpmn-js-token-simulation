import {
  is
} from './ModelUtil';


export default function SubProcessBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:SubProcess', this);
}

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element,
    scope
  } = context;

  const startEvent = findSubProcessStart(element);

  if (!startEvent) {
    throw new Error('no sub-process start event');
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope
  });
};

SubProcessBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior'
];


// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}