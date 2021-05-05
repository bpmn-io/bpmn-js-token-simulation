import StartEventBehavior from './StartEventBehavior';
import EndEventBehavior from './EndEventBehavior';

//import CatchEventBehavior from './CatchEventBehavior';
//import ThrowEventBehavior from './ThrowEventBehavior';
import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';
import TaskBehavior from './TaskBehavior';
import SequenceFlowBehavior from './SequenceFlowBehavior';

//import ThrowEventBehavior from './ThrowEventBehavior';
//import ParallelGatewayBehavior from './ParallelGatewayBehavior';
//import SubProcessBehavior from './SubProcessBehavior';

export default {
  __init__: [
    'startEventBehavior',
    'endEventBehavior',
    'exclusiveGatewayBehavior',
    'taskBehavior',
    'sequenceFlowBehavior'
  ],
  startEventBehavior: [ 'type', StartEventBehavior ],
  endEventBehavior: [ 'type', EndEventBehavior ],
  exclusiveGatewayBehavior: [ 'type', ExclusiveGatewayBehavior ],
  taskBehavior: [ 'type', TaskBehavior ],
  sequenceFlowBehavior: [ 'type', SequenceFlowBehavior ]
};