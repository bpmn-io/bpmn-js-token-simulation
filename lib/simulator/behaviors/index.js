import StartEventBehavior from './StartEventBehavior';
import EndEventBehavior from './EndEventBehavior';
import BoundaryEventBehavior from './BoundaryEventBehavior';
import IntermediateCatchEventBehavior from './IntermediateCatchEventBehavior';
import IntermediateThrowEventBehavior from './IntermediateThrowEventBehavior';

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
    'boundaryEventBehavior',
    'intermediateCatchEventBehavior',
    'intermediateThrowEventBehavior',
    'exclusiveGatewayBehavior',
    'parallelGatewayBehavior',
    'activityBehavior',
    'subProcessBehavior',
    'sequenceFlowBehavior',
    'messageFlowBehavior'
  ],
  startEventBehavior: [ 'type', StartEventBehavior ],
  endEventBehavior: [ 'type', EndEventBehavior ],
  boundaryEventBehavior: [ 'type', BoundaryEventBehavior ],
  intermediateCatchEventBehavior: [ 'type', IntermediateCatchEventBehavior ],
  intermediateThrowEventBehavior: [ 'type', IntermediateThrowEventBehavior ],
  exclusiveGatewayBehavior: [ 'type', ExclusiveGatewayBehavior ],
  parallelGatewayBehavior: [ 'type', ParallelGatewayBehavior ],
  activityBehavior: [ 'type', ActivityBehavior ],
  subProcessBehavior: [ 'type', SubProcessBehavior ],
  sequenceFlowBehavior: [ 'type', SequenceFlowBehavior ],
  messageFlowBehavior: [ 'type', MessageFlowBehavior ]
};