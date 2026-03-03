import ContextPads from './ContextPads';

import ExclusiveGatewayHandler from './handler/ExclusiveGatewayHandler';
import InclusiveGatewayHandler from './handler/InclusiveGatewayHandler';
import PauseHandler from './handler/PauseHandler';
import TriggerHandler from './handler/TriggerHandler';

import ScopeFilterModule from '../scope-filter';
import ElementOrderModule from '../element-order';

export default {
  __depends__: [
    ScopeFilterModule,
    ElementOrderModule
  ],
  __init__: [
    'contextPads',
    'pauseHandler',
    'triggerHandler',
    'exclusiveGatewayHandler',
    'inclusiveGatewayHandler'
  ],
  contextPads: [ 'type', ContextPads ],
  pauseHandler: [ 'type', PauseHandler ],
  triggerHandler: [ 'type', TriggerHandler ],
  exclusiveGatewayHandler: [ 'type', ExclusiveGatewayHandler ],
  inclusiveGatewayHandler: [ 'type', InclusiveGatewayHandler ]
};