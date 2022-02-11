# Simulation Support

[A module](../../lib/simulation-support) that adds (semi-) automatic testing capabilities and introspection to a [token simulation instance](https://github.com/bpmn-io/bpmn-js-token-simulation).

![Simulation Screen Capture](./screencapture.gif)


## Features

* Record and assert the trace of execution
* Toggle pause and resume
* Await element enter and exit
* Trigger event / continue execution


## Usage

Testing and introspection capabiliies are hooked up via the [`simulation-support` module](../../lib/simulation-support):

```javascript
import SimulationSupportModule from 'bpmn-js-token-simulation/lib/simulation-support';

const modeler = new BpmnModeler({
  additionalModules: [
    ...,
    SimulationSupportModule
  ]
});
```

The module provides the [`SimulationSupport`](../../lib/simulation-support/SimulationSupport.js) service to drive the simulation:

```javascript
const simulationSupport = modeler.get('simulationSupport');

// enable simulation
simulationSupport.toggleSimulation(true);

// toggle pause on activity
simulationSupport.triggerElement('UserTask_1');

// start simulation
simulationSupport.triggerElement('StartEvent_1');

await simulationSupport.elementEnter('UserTask_1');

window.alert('WANT ME TO CONTINUE?');

// trigger un-pause
simulationSupport.triggerElement('UserTask_1');
```
