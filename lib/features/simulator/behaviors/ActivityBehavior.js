import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function ActivityBehavior(simulator) {
  this._simulator = simulator;

  const elements = [
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ReceiveTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ];

  for (const element of elements) {
    simulator.registerBehavior(element, this);
  }
}

ActivityBehavior.prototype.signal = function(context) {
  this._simulator.exit({
    ...context,
    signal: true
  });
};

ActivityBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const config = this._simulator.getConfig(element);

  const wait = config && config.wait;

  const waiting = element.incoming.find(c => is(c, 'bpmn:MessageFlow'));

  if (wait || waiting) {
    return;
  }

  this._simulator.exit(context);
};

ActivityBehavior.prototype.exit = function(context) {

  const {
    element,
    scope,
    signal
  } = context;

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  // TODO(nikku): move split behavior into shared place
  for (const outgoing of element.outgoing) {

    if (is(outgoing, 'bpmn:MessageFlow')) {
      this._simulator.signal({
        element: outgoing
      });
    }

    if (is(outgoing, 'bpmn:SequenceFlow')) {
      this._simulator.enter({
        element: outgoing,
        scope
      });
    }
  }

  return signal ? 2 : 1;
};

ActivityBehavior.$inject = [ 'simulator' ];