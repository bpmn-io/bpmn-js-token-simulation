import {
  is
} from './ModelUtil';


export default function MessageFlowBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:MessageFlow', this);
}

MessageFlowBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

MessageFlowBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

  const target = element.target;

  // (a) scope waiting at element will be signaled
  const waitingScope = this._simulator.findScope({
    element: target.parent,
    waitsOnElement: target
  });

  if (waitingScope || is(target, 'bpmn:StartEvent')) {
    this._simulator.signal({
      element: target,
      scope: waitingScope
    });
  } else {

    // (b) scope active with element => log message received at element
    const targetScope = this._simulator.findScope({
      element: target.parent
    });

    if (targetScope) {

      // TODO(nikku): log message received
    } else {

      // (c) no scope at target => message is just discarted
    }
  }

  this._simulator.destroyScope(scope);
};

MessageFlowBehavior.$inject = [ 'simulator' ];