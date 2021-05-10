var prefix = 'tokenSimulation';

module.exports = {
  TOGGLE_MODE_EVENT: prefix + '.toggleMode',
  GENERATE_TOKEN_EVENT: prefix + '.generateToken',
  CONSUME_TOKEN_EVENT: prefix + '.consumeToken',
  PLAY_SIMULATION_EVENT: prefix + '.playSimulation',
  PAUSE_SIMULATION_EVENT: prefix + '.pauseSimulation',
  RESET_SIMULATION_EVENT: prefix + '.resetSimulation',
  TERMINATE_EVENT: prefix + '.terminateEvent',
  UPDATE_ELEMENTS_EVENT: prefix + '.updateElements',
  UPDATE_ELEMENT_EVENT: prefix + '.updateElement',
  PROCESS_INSTANCE_CREATED_EVENT: prefix + '.processInstanceCreated',
  PROCESS_INSTANCE_FINISHED_EVENT: prefix + '.processInstanceFinished',
  ANIMATION_CREATED_EVENT: prefix + '.animationCreated',
  ANIMATION_SPEED_CHANGED_EVENT: prefix + '.animationSpeedChanged',
  ELEMENT_CHANGED_EVENT: 'tokenSimulation.simulator.elementChanged',
  SCOPE_DESTROYED_EVENT: 'tokenSimulation.simulator.destroyScope',
  SCOPE_CHANGED_EVENT: 'tokenSimulation.simulator.scopeChanged',
  SCOPE_CREATE_EVENT: 'tokenSimulation.simulator.createScope',
  SCOPE_FILTER_CHANGED_EVENT: prefix + '.scopeFilterChanged',
  TRACE: 'tokenSimulation.simulator.trace'
};