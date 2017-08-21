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

* Normal Start Event
* Intermediate Catch Event
* End Event
* Exclusive Gateway
* Inklusive Gateway
* Parallel Gateway
* Task

## Licence

MIT