import StartEventBehavior from './StartEventBehavior';
import EndEventBehavior from './EndEventBehavior';
import CatchEventBehavior from './CatchEventBehavior';
import BoundaryEventBehavior from './BoundaryEventBehavior';

// import ThrowEventBehavior from './ThrowEventBehavior';

import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';
import ParallelGatewayBehavior from './ParallelGatewayBehavior';

import TaskBehavior from './TaskBehavior';
import SubProcessBehavior from './SubProcessBehavior';

import SequenceFlowBehavior from './SequenceFlowBehavior';


export default {
  __init__: [
    'startEventBehavior',
    'endEventBehavior',
    'catchEventBehavior',
    'boundaryEventBehavior',
    'exclusiveGatewayBehavior',
    'parallelGatewayBehavior',
    'taskBehavior',
    'subProcessBehavior',
    'sequenceFlowBehavior'
  ],
  startEventBehavior: [ 'type', StartEventBehavior ],
  endEventBehavior: [ 'type', EndEventBehavior ],
  catchEventBehavior: [ 'type', CatchEventBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  exclusiveGatewayBehavior: [ 'type', ExclusiveGatewayBehavior ],
  parallelGatewayBehavior: [ 'type', ParallelGatewayBehavior ],
  taskBehavior: [ 'type', TaskBehavior ],
  subProcessBehavior: [ 'type', SubProcessBehavior ],
  sequenceFlowBehavior: [ 'type', SequenceFlowBehavior ]
};