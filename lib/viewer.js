module.exports = {
  __depends__: [
    require('./simulator').default,
    require('./animation').default,
    require('./features/colored-scopes').default,
    require('./features/context-pads').default,
    require('./features/scope-filter').default,
    require('./features/simulation-state').default,
    require('./features/show-scopes').default,
    require('./features/notifications').default,
    require('./features/log').default,
    require('./features/element-support').default
  ],
  __init__: [
    'elementNotifications',
    'exclusiveGatewaySettings',
    'pauseSimulation',
    'preserveElementColors',
    'resetSimulation',
    'setAnimationSpeed',
    'toggleMode',
    'tokenCount',
    'tokenSimulationPalette'
  ],
  'elementNotifications': [ 'type', require('./features/element-notifications').default ],
  'exclusiveGatewaySettings': [ 'type', require('./features/exclusive-gateway-settings').default ],
  'pauseSimulation': [ 'type', require('./features/pause-simulation').default ],
  'preserveElementColors': [ 'type', require('./features/preserve-element-colors').default ],
  'resetSimulation': [ 'type', require('./features/reset-simulation').default ],
  'setAnimationSpeed': [ 'type', require('./features/set-animation-speed').default ],
  'toggleMode': [ 'type', require('./features/toggle-mode/viewer').default ],
  'tokenCount': [ 'type', require('./features/token-count').default ],
  'tokenSimulationPalette': [ 'type', require('./features/palette') ]
};