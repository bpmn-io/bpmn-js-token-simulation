import SimulatorModule from './simulator';
import AnimationModule from './animation';
import ColoredScopesModule from './features/colored-scopes';
import ContextPadsModule from './features/context-pads';
import SimulationStateModule from './features/simulation-state';
import ShowScopesModule from './features/show-scopes';
import LogModule from './features/log';
import ElementSupportModule from './features/element-support';
import PauseSimulationModule from './features/pause-simulation';
import ResetSimulationModule from './features/reset-simulation';
import TokenCountModule from './features/token-count';
import SetAnimationSpeedModule from './features/set-animation-speed';

import ExclusiveGatewaySettingsModule from './features/exclusive-gateway-settings';
import PreserveElementColorsModule from './features/preserve-element-colors';
import TokenSimulationPaletteModule from './features/palette';

export default {
  __depends__: [
    SimulatorModule,
    AnimationModule,
    ColoredScopesModule,
    ContextPadsModule,
    SimulationStateModule,
    ShowScopesModule,
    LogModule,
    ElementSupportModule,
    PauseSimulationModule,
    ResetSimulationModule,
    TokenCountModule,
    SetAnimationSpeedModule,
    ExclusiveGatewaySettingsModule,
    PreserveElementColorsModule,
    TokenSimulationPaletteModule
  ]
};