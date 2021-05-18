import {
  isLink
} from './ModelUtil';


export default function IntermediateCatchEventBehavior(
    simulator,
    activityBehavior) {

  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
  simulator.registerBehavior('bpmn:ReceiveTask', this);
}

IntermediateCatchEventBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

IntermediateCatchEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  if (isLink(element)) {
    this._simulator.exit(context);
  }
};

IntermediateCatchEventBehavior.prototype.exit = function(context) {
  return this._activityBehavior.exit(context);
};

IntermediateCatchEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];