import NeutralElementColors from './NeutralElementColors';
import ElementColorsModule from '../element-colors';
import SimulationStylesModule from '../simulation-styles';

export default {
  __depends__: [ ElementColorsModule, SimulationStylesModule ],
  __init__: [
    'neutralElementColors'
  ],
  neutralElementColors: [ 'type', NeutralElementColors ]
};