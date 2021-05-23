import ToggleModeModule from './features/toggle-mode/viewer';

import BaseModule from './base';

export default {
  __depends__: [
    BaseModule,
    ToggleModeModule
  ]
};