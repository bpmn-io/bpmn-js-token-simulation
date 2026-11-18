import AnimatedActivityBehavior from './AnimatedActivityBehavior';
import AnimatedIntermediateCatchEventBehavior from './AnimatedIntermediateCatchEventBehavior';
import AnimatedMessageFlowBehavior from './AnimatedMessageFlowBehavior';
import AnimatedSequenceFlowBehavior from './AnimatedSequenceFlowBehavior';

export default {
  activityBehavior: [ 'type', AnimatedActivityBehavior ],
  intermediateCatchEventBehavior: [ 'type', AnimatedIntermediateCatchEventBehavior ],
  sequenceFlowBehavior: [ 'type', AnimatedSequenceFlowBehavior ],
  messageFlowBehavior: [ 'type', AnimatedMessageFlowBehavior ]
};