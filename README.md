# bpmn-js Token Simulation

A bpmn-js extension for token simulation.

> Looking for the Camunda Modeler Plugin? Get it [here](https://github.com/philippfromme/bpmn-js-token-simulation-plugin)!

![Screencast](docs/screencast.gif)

## Installation

Install via [npm](http://npmjs.com/).

```
npm install bpmn-js-token-simulation
```

Add as additional module to [bpmn-js]().

### Modeler

```javascript
var BpmnModeler = require('bpmn-js/lib/Modeler');
var tokenSimulation = require('bpmn-js-token-simulation');

var modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    tokenSimulation
  ]
});
```

### Viewer

```javascript
var BpmnViewer = require('bpmn-js/lib/NavigatedViewer');
var tokenSimulation = require('bpmn-js-token-simulation/lib/viewer');

var viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    tokenSimulation
  ]
});
```

## Example

Install dependencies.

```bash
npm install
```

Run example.

```bash
npm run dev
```

Check out `localhost:9013`.

## Supported Elements

* Start Event
* Intermediate Catch Event
* Intermediate Throw Event
* End Event
* Terminate End Event
* Exclusive Gateway
* Parallel Gateway
* Event-based Gateway
* Task
* Subprocess
* BoundaryEvents attached to Subprocess

## Licence

MIT