import ElementWait from './ElementWait';

import ToggleAutomatic from '../toggle-automatic';

export default {
  __depends__: [
    ToggleAutomatic
  ],
  __init__: [
    'elementWait'
  ],
  elementWait: [ 'type', ElementWait ]
};