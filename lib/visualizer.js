import ToggleModeModule from './features/toggle-mode/viewer';

import VisualizerBaseModule from './visualizer-base';

export default {
  __depends__: [
    VisualizerBaseModule,
    ToggleModeModule
  ]
};
