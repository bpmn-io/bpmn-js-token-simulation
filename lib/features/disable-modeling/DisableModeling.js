import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const HIGH_PRIORITY = 10001;

// editor actions that must stay available while the canvas is locked
const SIMULATION_EDITOR_ACTIONS = [
  'toggleTokenSimulation',
  'toggleTokenSimulationLog',
  'togglePauseTokenSimulation',
  'resetTokenSimulation'
];


/**
 * Locks the canvas while token simulation is active by delegating to the
 * `canvasLock` service. Keeps token simulation's own editor actions available
 * while the canvas is locked.
 *
 * @param {import('diagram-js/lib/core/EventBus').default} eventBus
 * @param {import('@bpmn-io/diagram-js-canvas-lock').CanvasLock} canvasLock
 */
export default function DisableModeling(eventBus, canvasLock) {
  eventBus.on(TOGGLE_MODE_EVENT, function(event) {
    if (event.active) {
      canvasLock.lock();
    } else {
      canvasLock.unlock();
    }
  });

  // run before canvasLock's blocker (priority 10000); returning `true` halts
  // propagation and keeps the simulation's own actions available while locked
  eventBus.on('editorActions.allowed', HIGH_PRIORITY, function(event) {
    if (SIMULATION_EDITOR_ACTIONS.includes(event.action)) {
      return true;
    }
  });
}

DisableModeling.$inject = [
  'eventBus',
  'canvasLock'
];
