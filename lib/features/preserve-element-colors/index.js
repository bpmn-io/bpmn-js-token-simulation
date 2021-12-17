import PreserveElementColors from './PreserveElementColors';
import ElementColorsModule from '../element-colors';

export default {
  __depends__: [ ElementColorsModule ],
  __init__: [
    'preserveElementColors'
  ],
  preserveElementColors: [ 'type', PreserveElementColors ]
};