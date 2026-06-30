import BaseModule from './base';
import CanvasLockModule from '@bpmn-io/diagram-js-canvas-lock';
import DisableModelingModule from './features/disable-modeling';

import ToggleModeModule from './features/toggle-mode/modeler';
import TokenSimulationEditorActionsModule from './features/editor-actions';
import TokenSimulationKeyboardBindingsModule from './features/keyboard-bindings';

export default {
  __depends__: [
    BaseModule,
    CanvasLockModule,
    DisableModelingModule,
    ToggleModeModule,
    TokenSimulationEditorActionsModule,
    TokenSimulationKeyboardBindingsModule
  ]
};