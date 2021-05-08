module.exports = {
  __depends__: [
    require('./simulator').default,
    require('./animation').default,
    require('./features/colored-scopes').default,
    require('./features/context-pads').default,
    require('./features/simulation-state').default,
    require('./features/show-scopes').default
  ],
  __init__: [
    'elementNotifications',
    'elementSupport',
    'exclusiveGatewaySettings',
    'log',
    'notifications',
    'pauseSimulation',
    'preserveElementColors',
    'resetSimulation',
    'setAnimationSpeed',
    'toggleMode',
    'tokenCount',
    'tokenSimulationPalette'
  ],
  'elementNotifications': [ 'type', require('./features/element-notifications').default ],
  'elementSupport': [ 'type', require('./features/element-support') ],
  'exclusiveGatewaySettings': [ 'type', require('./features/exclusive-gateway-settings') ],
  'log': [ 'type', require('./features/log').default ],
  'notifications': [ 'type', require('./features/notifications').default ],
  'pauseSimulation': [ 'type', require('./features/pause-simulation').default ],
  'preserveElementColors': [ 'type', require('./features/preserve-element-colors').default ],
  'resetSimulation': [ 'type', require('./features/reset-simulation').default ],
  'setAnimationSpeed': [ 'type', require('./features/set-animation-speed').default ],
  'toggleMode': [ 'type', require('./features/toggle-mode/viewer') ],
  'tokenCount': [ 'type', require('./features/token-count').default ],
  'tokenSimulationPalette': [ 'type', require('./features/palette') ]
};