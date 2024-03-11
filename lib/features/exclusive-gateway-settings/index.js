import ExclusiveGatewaySettings from './ExclusiveGatewaySettings';
import ElementColorsModule from '../element-colors';
import SimulationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ElementColorsModule,
    SimulationStylesModule
  ],
  exclusiveGatewaySettings: [ 'type', ExclusiveGatewaySettings ]
};