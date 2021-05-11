# Changelog

All notable changes to the [bpmn-js-token-simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.12.0

_A complete rewrite of the simulator, vastly improving stability._

* `FEAT`: extract simulator into standalone component ([#65](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/65), [#66](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/66))
* `FEAT`: show scope in notification and log panel
* `FEAT`: color tokens and element notifications according to scope
* `FEAT`: make notification and log panel aware of active scope filter
* `FEAT`: support multiple parallel scopes
* `FEAT`: support message flows
* `FEAT`: require external trigger on all activities with incoming message flows
* `FEAT`: support link events
* `FEAT`: increase fastest animation speed
* `FEAT`: improve animation speed on longer connections
* `FIX`: correct end event behaving like terminate end event ([#59](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/59))
* `FIX`: correct gateway toggle inside sub-process
([#61](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/61))
* `FIX`: better scope highlight color for canvas ([`fdbf665f`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/fdbf665f2079486d4f3605a51830190d9766afbf))
* `CHORE`: migrate to GitHub actions
* `CHORE`: upgrade the code base to ES6

### Breaking Changes

* A modern browser supporting ES6 or additional transpilation is now required to use this library
* Reworked data-handling and most internal components. If you are looking to drive the simulation via API _or_ query the simulation state refer to the [`simulator`](lib/simulator/Simulator.js).

## 0.11.1

* `FIX`: correct setting animation speed

## 0.11.0

* `FEAT`: ignore `bpmn:Group` elements ([#58](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/58))
* `FEAT`: ignore `bpmn:MessageFlow` elements during simulation ([#52](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/52))
* `FEAT`: support `bpmn:SentTask` and `bpmn:ReceiveTask` ([#57](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/57))
* `FEAT`: make token move duration a constant time ([`0156fb8e`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/0156fb8eaa8fe686e75aa744007d61b7b6ed383f))
* `FEAT`: color sequence flow labels along with sequence flows ([`a310ac66`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/a310ac66eaf8b3a1b841f1a37d4f2c6f70b79834))
* `FIX`: consistently ease in and ease out token animations ([`76562b6d`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/76562b6dd6f416b163e32bc6c9012fda34994469))
* `FIX`: make intermediate throw events work, again ([#53](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/53))
* `FIX`: do not interfer with base bpmn-js styles
* `FIX`: hide context pads for completed sub-process scopes ([`26d68763`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/26d68763c9789d2a22334855d916c676c84cd293))
* `FIX`: correct process instance state finished detection ([#28](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/28))
* `CHORE`: improve button and overlay colors

## 0.10.0

* `CHORE`: update colors
* `CHORE`: update to `bpmn-js@7`

## 0.9.1

* `FIX`: fix simulation state ([#51](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/51))

## 0.9.0

* `FEAT`: add support for call activity ([#49](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/49))

## 0.8.1

* `FIX`: don't override default modeler keybindings ([#41](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/41))
* `FIX`: bind keyboard listeners on `keyboard.init` (not diagram import)

## 0.8.0

* `CHORE`: update to `bpmn-js@3` ([#34](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/34))
* `CHORE`: drop lodash dependency for smaller bundle sizes
* `CHORE`: ignore dev assets in packaged bundle
* `CHORE`: add linting and test coverage

### Breaking Changes

* This drops support for `bpmn-js<3`.

## ...

Check `git log` for earlier history.
