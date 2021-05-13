module.exports = {
  __depends__: [
    require('./simulator').default,
    require('./animation').default,
    require('./features/colored-scopes').default,
    require('./features/context-pads').default,
    require('./features/scope-filter').default,
    require('./features/simulation-state').default,
    require('./features/show-scopes').default,
    require('./features/log').default,
    require('./features/element-support').default,
    require('./features/pause-simulation').default,
    require('./features/reset-simulation').default,
    require('./features/token-count').default,
    require('./features/set-animation-speed').default
  ],
  __init__: [
    'exclusiveGatewaySettings',
    'preserveElementColors',
    'toggleMode',
    'tokenSimulationPalette'
  ],
  'exclusiveGatewaySettings': [ 'type', require('./features/exclusive-gateway-settings').default ],
  'preserveElementColors': [ 'type', require('./features/preserve-element-colors').default ],
  'toggleMode': [ 'type', require('./features/toggle-mode/viewer').default ],
  'tokenSimulationPalette': [ 'type', require('./features/palette') ]
};