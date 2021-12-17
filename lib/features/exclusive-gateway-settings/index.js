import ExclusiveGatewaySettings from './ExclusiveGatewaySettings';
import ElementColorsModule from '../element-colors';
import SimlationStylesModule from '../simulation-styles';

export default {
  __depends__: [
    ElementColorsModule,
    SimlationStylesModule
  ],
  exclusiveGatewaySettings: [ 'type', ExclusiveGatewaySettings ]
};