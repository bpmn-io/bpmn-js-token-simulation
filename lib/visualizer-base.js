import SimulatorModule from './simulator';
import ColoredScopesModule from './features/colored-scopes';
import SimulationStateModule from './features/simulation-state';
import ShowScopesModule from './features/show-scopes';
import ElementSupportModule from './features/element-support';
import TokenCountModule from './features/token-count';
import ExclusiveGatewaySettingsModule from './features/exclusive-gateway-settings';
import NeutralElementColors from './features/neutral-element-colors';
import InclusiveGatewaySettingsModule from './features/inclusive-gateway-settings';
import ExecutionVisualizerModule from './features/execution-visualizer';

export default {
  __depends__: [
    SimulatorModule,
    ColoredScopesModule,
    SimulationStateModule,
    ShowScopesModule,
    ElementSupportModule,
    TokenCountModule,
    ExclusiveGatewaySettingsModule,
    NeutralElementColors,
    InclusiveGatewaySettingsModule,
    ExecutionVisualizerModule
  ]
};
