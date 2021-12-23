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

  // skip cosmetic flows that model generic,
  // undirected communication
  if (is(target, 'bpmn:Participant')) {
    return;
  }

  // (a) scope waiting at element will be signaled
  const eventSource = target.incoming.find(
    incoming => is(incoming.source, 'bpmn:EventBasedGateway')
  );

  const waitingScope = this._simulator.findScope({
    element: eventSource && eventSource.source || target
  });

  if (waitingScope) {
    this._simulator.signal({
      element: target,
      scope: waitingScope,
      initiator: scope
    });
  } else if (is(target, 'bpmn:StartEvent')) {
    this._simulator.signal({
      startEvent: target,
      element: target.parent,
      initiator: scope
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
};

MessageFlowBehavior.$inject = [ 'simulator' ];