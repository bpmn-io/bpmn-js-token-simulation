import NeutralElementColors from './NeutralElementColors';
import ElementColorsModule from '../element-colors';

export default {
  __depends__: [ ElementColorsModule ],
  __init__: [
    'neutralElementColors'
  ],
  neutralElementColors: [ 'type', NeutralElementColors ]
};