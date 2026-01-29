# Execution Visualizer

This module provides a way to visualize actual BPMN execution without running autonomous simulation. Instead of simulating token flow, you can drive the visualization programmatically from external execution data.

## Key Features

- **No Token Animation**: Elements are styled instantly without animated token movement
- **Hidden Controls**: No log panel, play/pause buttons, or reset controls
- **Programmatic Control**: Mode switching and execution state controlled via API
- **Simple API**: Set executed elements, executed flows, and active element via single method call

## Usage

### Basic Setup

```javascript
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import TokenSimulationVisualizerModule from 'bpmn-js-token-simulation/lib/visualizer';

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    TokenSimulationVisualizerModule
  ]
});

await viewer.importXML(bpmnXML);
```

### Accessing Services

```javascript
const toggleMode = viewer.get('toggleMode');
const executionVisualizer = viewer.get('executionVisualizer');
```

### API Methods

#### Enable Visualization Mode

```javascript
// Turn on visualization mode (activates visual styling)
toggleMode.toggleMode(true);

// Turn off visualization mode (restores original diagram)
toggleMode.toggleMode(false);
```

#### Set Execution State

```javascript
executionVisualizer.setExecutionState({
  completed: ['StartEvent_1', 'Flow_1', 'Task_1', 'Flow_2', 'Task_2', 'Flow_3'],  // IDs of completed elements and flows
  active: 'Task_3'                                                                 // ID(s) of currently active element(s)
});
```

- **completed**: Array of element IDs that have been completed, including both shapes and sequence flows (styled in blue)
- **active**: ID or array of IDs of the currently active element(s) (styled in blue with higher priority)

**Note**: `active` can be either a single string ID or an array of string IDs to support multiple active elements:

```javascript
// Single active element
executionVisualizer.setExecutionState({
  completed: ['StartEvent_1', 'Flow_1'],
  active: 'Task_1'
});

// Multiple active elements (e.g., parallel execution)
executionVisualizer.setExecutionState({
  completed: ['StartEvent_1', 'Flow_1', 'ParallelGateway_1'],
  active: ['Task_1', 'Task_2', 'Task_3']
});
```

#### Clear Visualization

```javascript
// Remove all execution visualization styling
executionVisualizer.clear();
```

#### Get Current State

```javascript
const state = executionVisualizer.getExecutionState();
// Returns: { completed: [...], active: [...] }
```

## Visual Styling

- **Executed Elements**: Blue stroke, no background fill
- **Active Element**: Red stroke, no background fill
- **Priority**: Active element styling (priority 2000) overrides executed styling (priority 1000)

## Events

The execution visualizer fires custom events on the event bus:

```javascript
const eventBus = viewer.get('eventBus');

// Fired when execution state changes
eventBus.on('executionVisualizer.stateChanged', (event) => {
  console.log('Completed elements:', event.completed);
  console.log('Active elements:', event.active);
});

// Fired when visualization is cleared
eventBus.on('executionVisualizer.cleared', () => {
  console.log('Visualization cleared');
});
```

## Differences from Simulation Mode

| Feature | Simulation Mode | Visualizer Mode |
|---------|----------------|-----------------|
| Token Animation | ✅ Animated tokens | ❌ No animation |
| Log Panel | ✅ Visible | ❌ Hidden |
| Play/Pause Controls | ✅ Visible | ❌ Hidden |
| Reset Button | ✅ Visible | ❌ Hidden |
| Context Pads | ✅ Visible | ❌ Hidden |
| Mode Toggle | ✅ UI Button | ✅ Programmatic only |
| Token Count | ✅ Visible | ✅ Visible |
| Execution Control | ⚙️ Autonomous simulation | ⚙️ External control |

## Example

See [example/visualizer.html](../example/visualizer.html) and [example/src/visualizer.js](../example/src/visualizer.js) for a complete working example.

## Module Structure

The visualizer mode includes these modules (from [lib/visualizer-base.js](../lib/visualizer-base.js)):

- **SimulatorModule**: Core scope and state management (behaviors disabled)
- **ColoredScopesModule**: Scope coloring for multi-instance scenarios
- **SimulationStateModule**: State tracking
- **ShowScopesModule**: Scope visualization
- **ElementSupportModule**: BPMN element type support
- **TokenCountModule**: Token count overlays
- **ExclusiveGatewaySettingsModule**: Gateway configuration
- **InclusiveGatewaySettingsModule**: Gateway configuration  
- **NeutralElementColors**: Base element coloring
- **ExecutionVisualizerModule**: External execution visualization (new)

Excluded modules (compared to full simulation):
- AnimationModule
- LogModule
- PauseSimulationModule
- ResetSimulationModule
- TokenSimulationPaletteModule
- ContextPadsModule
