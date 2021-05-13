import BaseModule from './base';
import DisableModelingModule from './features/disable-modeling';

import ToggleMode from './features/toggle-mode/modeler';
import TokenSimulationEditorActions from './features/editor-actions';
import TokenSimulationKeyboardBindings from './features/keyboard-bindings';

export default {
  __depends__: [
    BaseModule,
    DisableModelingModule
  ],
  __init__: [
    'toggleMode',
    'tokenSimulationEditorActions',
    'tokenSimulationKeyboardBindings'
  ],
  'toggleMode': [ 'type', ToggleMode ],
  'tokenSimulationEditorActions': [ 'type', TokenSimulationEditorActions ],
  'tokenSimulationKeyboardBindings': [ 'type', TokenSimulationKeyboardBindings ]
};