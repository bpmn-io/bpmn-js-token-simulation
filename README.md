# bpmn-js Token Simulation

[![CI](https://github.com/bpmn-io/bpmn-js-token-simulation/workflows/CI/badge.svg)](https://github.com/bpmn-io/bpmn-js-token-simulation/actions?query=workflow%3ACI)

A BPMN 2.0 specification compliant token simulator, built as a [bpmn-js](https://github.com/bpmn-io/bpmn-js) extension.

[![Screencast](docs/screenshot.png)](https://bpmn-io.github.io/bpmn-js-token-simulation/modeler.html?e=1&pp=1)

Try it on the [classic booking example](https://bpmn-io.github.io/bpmn-js-token-simulation/modeler.html?e=1&pp=1&diagram=https%3A%2F%2Fraw.githubusercontent.com%2Fbpmn-io%2Fbpmn-js-token-simulation%2Fmaster%2Ftest%2Fspec%2Fbooking.bpmn) or checkout the [full capability demo](https://bpmn-io.github.io/bpmn-js-token-simulation/modeler.html?e=1&pp=1&diagram=https%3A%2F%2Fraw.githubusercontent.com%2Fbpmn-io%2Fbpmn-js-token-simulation%2Fmaster%2Fexample%2Fresources%2Fall.bpmn).


## Installation

Install via [npm](http://npmjs.com/).

```
npm install bpmn-js-token-simulation
```


## Usage

Add as additional module to [bpmn-js](https://github.com/bpmn-io/bpmn-js).

### Modeler

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import TokenSimulationModule from 'bpmn-js-token-simulation';

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    TokenSimulationModule
  ]
});
```

### Viewer

```javascript
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import TokenSimulationModule from 'bpmn-js-token-simulation/lib/viewer';

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    TokenSimulationModule
  ]
});
```


## Build and Run

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case you may run any of the following commands:

```sh
# build the library and run all tests
npm run all

# run the full development setup
npm run dev

# spin up the example
npm run start:example
```


## Additional Resources

* [Making of token simulation](https://nikku.github.io/talks/2021-token-simulation/presentation.html) - The case for token simulation and how it builds on top of [bpmn-js](https://github.com/bpmn-io/bpmn-js)
* [Token simulation internals](https://nikku.github.io/talks/2021-token-simulation-internals/presentation.html) - Detailed walk through the simulators core
* [Camunda Modeler Token Simulation plug-in](https://github.com/camunda/camunda-modeler-token-simulation-plugin) - Token simulation for [Camunda](https://camunda.com/) users


## Licence

MIT
