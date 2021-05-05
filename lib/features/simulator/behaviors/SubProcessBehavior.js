import {
  is
} from '../../../util/ElementHelper';


export default function SubProcessBehavior(simulator) {
  this._simulator = simulator;

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

  const {
    element,
    scope
  } = context;

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  // TODO(nikku): move split behavior into shared place
  for (const outgoing of element.outgoing) {
    this._simulator.enter({
      element: outgoing,
      scope
    });
  }
};

SubProcessBehavior.$inject = [ 'simulator' ];


// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => is(child, 'bpmn:StartEvent'));
}