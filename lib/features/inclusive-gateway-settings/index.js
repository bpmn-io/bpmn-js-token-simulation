import InclusiveGatewaySettings from './InclusiveGatewaySettings';
import ElementColorsModule from '../element-colors';
import SimulationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ElementColorsModule,
    SimulationStylesModule
  ],
  inclusiveGatewaySettings: [ 'type', InclusiveGatewaySettings ]
};