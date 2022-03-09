# Changelog

All notable changes to the [bpmn-js-token-simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.27.0

* `CHORE`: support `bpmn-js@9`

## 0.26.0

* `FEAT`: add [simulation support](./docs/simulation-support) to programatically control the token simulation ([#112](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/112))

## 0.25.1

* `FIX`: correctly triggering of multiple signal start events ([#109](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/109))

## 0.25.0

* `FEAT`: rewrite simulator using event scopes and subscriptions ([#101](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/101))
* `FEAT`: support event rethrow and "absorption" ([#100](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/100))
* `FEAT`: trigger all startable elements inside `bpmn:SubProcess` ([#107](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/107), [`acdae242`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/107/commits/acdae242d72e36a35e9e31d70c13fbcdd1c168b6))
* `FEAT`: support transactions and cancel events ([#76](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/76), [#102](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/102), [`5026298b`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/102/commits/5026298b21699f0110b4e9d530dfca555e26ab8a))
* `FEAT`: support compensation ([#76](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/76), [#102](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/102), [`bcdad034`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/102/commits/bcdad034d5b8e0fae0de2ad638136dd27b78c729))
* `FEAT`: eagerly interrupt when entering event sub-process ([`452ce5ec`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/452ce5eca78aeca849514a6f0e8782ce1bdf8b41))
* `FEAT`: add `Simulator` APIs for (BPMN) event triggering and subscriptions ([`5da21ed8`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/101/commits/5da21ed8d66446b3e91090361086ab9b8d1000f9))
* `FEAT`: add `Simulator#waitForScopes` API ([`e23e57f0`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/102/commits/e23e57f0d7aadbda2fc2d8599e10a90d817f91e5))
* `FIX`: don't allow pause on event sub-process ([`af04910b`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/af04910b60ede5fa2ab0dd43818940dca71ec364))
* `FIX`: correct pause handling on receive tasks ([#99](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/99))
* `FIX`: ensure technically _equal_ events can still be signaled individually ([#103](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/103), [#107](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/107) [`15d14062`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/107/commits/15d140624b30835b6fff4bc1bbd93207f0afe226))
* `CHORE`: implement termination as a behavior ([`e92e8ff8`](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/101/commits/e92e8ff830a00803702f80f4f04be966fc5999b5))
* `CHORE`: remove destroyed scopes ([`b3662dc8`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/b3662dc8aeed8c5e34441e41c77ee7a6b06d0066))
* `CHORE`: namespace CSS ([#30](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/30))
* `CHORE`: add properties panel to example ([104](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/104))
* `DEPS`: update to `bpmn-js@8.9.0`

### Breaking Changes

* Generated markup and used CSS classes changed; things are consistently prefixed with `bts` now to avoid foreign classes crashing ([#30](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/30))
* Drop `destroyContext` in favor of dedicated scope state (failed/ended) ([#101](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/101))
* Reworked way the outside interacts with the simulator: Rather than signaling the simulator with knowledge of internal working mechanisms you trigger an event on a particular scope, notifying all registered subscribers. ([#101](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/101))
* Destroyed scopes are now longer kept around by simulator ([`b3662dc8`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/b3662dc8aeed8c5e34441e41c77ee7a6b06d0066))

## 0.24.0

* `FEAT`: return `Simulator#signal` scope
* `FEAT`: return `Simulator#enter` scope
* `FEAT`: support token sinks other than end events ([#94](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/94))
* `FEAT`: support error throw events ([`017aa885`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/017aa885822ad84368ed16730057dd8907407d53))
* `FIX`: read and restore colors in `bpmn-js >= 8.7` compatible manner ([#90](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/90))
* `FIX`: correct context-pads interaction with scope filters ([`6dc14819`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/6dc14819384ae87df49ad058964185ef06216ea5))
* `FIX`: make pause context-pad handler scope filter aware ([`7253969f`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/7253969f09c22e46ac4021eb2b2eedfd4bba2c59))
* `CHORE`: various example improvements

## 0.23.0

* `FEAT`: add pause at node feature ([`f6c6b06b`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/f6c6b06b553c549776c8e3159d8bc1f8f96a8070), [#91](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/91))
* `FEAT`: update context-pads rather than add and remove ([`84d288e7`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/84d288e72ed2217cb196a1002379ac525bedcdc8))
* `FEAT`: `tick` on out of bounds `elementChanged` ([`53230707`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/53230707f613939105e4878a115001db58d7d6c1))
* `FEAT`: update and inline icons ([`dc6eb1195`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/dc6eb1195eb64ee5cd85fa08966e573e2fed4d0f))
* `FEAT`: allow configuration of `ActivityBehavior` wait semantics ([`dcf1e855`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/dcf1e855ba2a9c3430a10bdb058d87457ad33dd1))
* `FIX`: reduce visual noise caused by context-pad updates
* `FIX`: mark parent as changed on `{create,destroy}Scope` ([`410659bc`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/410659bc8bf29a4d585972a7dcb0176dcebe1262))

## 0.22.0

* `FEAT`: allow simulation of bi-directional message flows ([#77](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/77))
* `FEAT`: execute message flows in interaction order
* `FEAT`: signal message receive with initiator
* `FIX`: prevent undirected message receive from signaling participant
* `CHORE`: detect message flow by element, not initiator

## 0.21.2

* `FIX`: make parallel gateway join properly ([#89](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/89))
* `CHORE`: make `log` optional in editor actions

## 0.21.1

* `FIX`: revert `main` to `module` entry point rename

## 0.21.0

* `CHORE`: complete migration to ES modules
* `CHORE`: mark package as side-effect free

### Breaking Changes

* We do now export a `module` rather than a `main` file.

## 0.20.0

* `FEAT`: rework animation ([#82](https://github.com/bpmn-io/bpmn-js-token-simulation/pull/82))
* `FEAT`: display parent scope in log and trace notifications ([`de08d9c7`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/de08d9c75822c928d88bebb0868829c944f676dc))
* `FIX`: only signal event sub-processes if parent is running ([`5aa7b019`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/5aa7b019880140ceb9fc000ae3ef07dcedae4bfc))
* `FIX`: do not reset token position on animation speed change
* `FIX`: escape element names displayed in log ([`3d4ed8f0`](https://github.com/bpmn-io/bpmn-js-token-simulation/commit/3d4ed8f003323658ef148c0657476cb36794f0c9))
* `DEPS`: remove `SVG.js` dependency
* `DEPS`: update to `bpmn-js@8.6.0`

## 0.19.3

* `FIX`: do not override global styles

## 0.19.2

* `FIX`: emit element changed events on simulation reset

## 0.19.1

* `FIX`: ignore destroyed scopes in `Scope#getTokensByElement`

## 0.19.0

* `FEAT`: support escalation
* `FEAT`: signal event-based gateway on signal

## 0.18.0

* `FEAT`: support signals
* `FEAT`: handle scope interruption according to BPMN 2.0 spec
* `FEAT`: signal event-based gateway on incoming messages
* `FEAT`: scope all activities

### Breaking Changes

* In order to start a process you must now signal the process element, not the start event contained in it.

## 0.17.0

* `FEAT`: improve scope filter behavior on scope creation and destruction
* `FIX`: correct trigger activity context pad activation

## 0.16.0

* `FEAT`: hide context pads if no action available in selected scope
* `CHORE`: migrate most components to ES6

## 0.15.1

* `FIX`: prevent signal of activities with active child scopes

## 0.15.0

* `FEAT`: allow to signal all waiting activities
* `FEAT`: various example improvements

## 0.14.0

* `FEAT`: add support for event sub-process ([#71](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/71))
* `FEAT`: add support for event-based gateway ([#72](https://github.com/bpmn-io/bpmn-js-token-simulation/issues/72))
* `FEAT`: support boundary events on tasks
* `FEAT`: rework context pads open/close handling
* `FEAT`: batch simulator element changed events
* `FIX`: correct scope filter integration with context pads

## 0.13.0

* `FEAT`: allow to toggle explicit mode
* `FEAT`: handle diagram import during simulation
* `FIX`: do not re-add toggle mode UI on diagram re-import

### Breaking Changes

* `tokenSimulation.toggleMode` event active flag renamed from `simulationModeActive` to `active`

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
