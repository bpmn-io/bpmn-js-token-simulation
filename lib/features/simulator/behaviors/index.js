import StartEventBehavior from './StartEventBehavior';
import EndEventBehavior from './EndEventBehavior';
import CatchEventBehavior from './CatchEventBehavior';
import BoundaryEventBehavior from './BoundaryEventBehavior';

// import ThrowEventBehavior from './ThrowEventBehavior';

import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';
import ParallelGatewayBehavior from './ParallelGatewayBehavior';

import ActivityBehavior from './ActivityBehavior';
import SubProcessBehavior from './SubProcessBehavior';

import SequenceFlowBehavior from './SequenceFlowBehavior';
import MessageFlowBehavior from './MessageFlowBehavior';


export default {
  __init__: [
    'startEventBehavior',
    'endEventBehavior',
    'catchEventBehavior',
    'boundaryEventBehavior',
    'exclusiveGatewayBehavior',
    'parallelGatewayBehavior',
    'activityBehavior',
    'subProcessBehavior',
    'sequenceFlowBehavior',
    'messageFlowBehavior'
  ],
  startEventBehavior: [ 'type', StartEventBehavior ],
  endEventBehavior: [ 'type', EndEventBehavior ],
  catchEventBehavior: [ 'type', CatchEventBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  exclusiveGatewayBehavior: [ 'type', ExclusiveGatewayBehavior ],
  parallelGatewayBehavior: [ 'type', ParallelGatewayBehavior ],
  activityBehavior: [ 'type', ActivityBehavior ],
  subProcessBehavior: [ 'type', SubProcessBehavior ],
  sequenceFlowBehavior: [ 'type', SequenceFlowBehavior ],
  messageFlowBehavior: [ 'type', MessageFlowBehavior ]
};