import ToggleMode from './features/toggle-mode/viewer';

import BaseModule from './base';

export default {
  __depends__: [
    BaseModule
  ],
  __init__: [
    'toggleMode'
  ],
  'toggleMode': [ 'type', ToggleMode ]
};