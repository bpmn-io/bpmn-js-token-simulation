import { expect } from 'chai';
import SimulatorModule from 'lib/features/simulator';

import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';


describe('simulator', function() {

  verify('simple', () => {

    // given
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_2:A',
      'exit:Flow_2:A',
      'enter:TASK:A',
      'exit:TASK:A',
      'enter:Flow_1:A',
      'exit:Flow_1:A',
      'enter:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('exclusive-gateway-fork-join', () => {

    // given
    setConfig(element('G_A'), {
      activeOutgoing: element('Flow_2')
    });

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_1:A',
      'exit:Flow_1:A',
      'enter:G_A:A',
      'exit:G_A:A',
      'enter:Flow_2:A',
      'exit:Flow_2:A',
      'enter:G_B:A',
      'exit:G_B:A',
      'enter:Flow_4:A',
      'exit:Flow_4:A',
      'enter:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('exclusive-gateway-join', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_2:A',
      'exit:Flow_2:A',
      'enter:GATE:A',
      'exit:GATE:A',
      'enter:Flow_1:A',
      'exit:Flow_1:A',
      'enter:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('parallel-gateway-stuck', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_2:A',
      'exit:Flow_2:A',
      'enter:GATE:A'
    ]);
  });


  verify('end-event', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_1:A',
      'enter:Flow_2:A',
      'exit:Flow_1:A',
      'exit:Flow_2:A',
      'enter:END:A',
      'enter:END:A',
      'exit:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('end-event-terminate', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_1:A',
      'enter:Flow_2:A',
      'exit:Flow_1:A',
      'exit:Flow_2:A',
      'enter:TASK:A',
      'enter:T_END:A',
      'exit:TASK:A',
      'exit:T_END:A',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('end-event-terminate-nested-scopes', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_4:A',
      'enter:Flow_6:A',
      'exit:Flow_4:A',
      'exit:Flow_6:A',
      'enter:SUB:A',
      'createScope:SUB:A',
      'enter:END_TERM:A',
      'signal:START_SUB:B',
      'exit:END_TERM:A',
      'destroyScope:SUB:B',
      'destroyScope:Process_1:A'
    ]);
  });


  verify('task-join', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_2:A',
      'enter:Flow_4:A',
      'exit:Flow_2:A',
      'exit:Flow_4:A',
      'enter:TASK:A',
      'enter:TASK:A',
      'exit:TASK:A',
      'exit:TASK:A',
      'enter:Flow_3:A',
      'enter:Flow_3:A',
      'exit:Flow_3:A',
      'exit:Flow_3:A',
      'enter:END:A',
      'enter:END:A',
      'exit:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);

  });


  verify('catch-event', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:ezerv23lf2oglpn9dgvn7ky0d',
      'exit:START:ezerv23lf2oglpn9dgvn7ky0d',
      'enter:Flow_1:ezerv23lf2oglpn9dgvn7ky0d',
      'exit:Flow_1:ezerv23lf2oglpn9dgvn7ky0d',
      'enter:CATCH:ezerv23lf2oglpn9dgvn7ky0d'
    ]);

  });


  verify('sub-process', () => {

    // when
    signal({
      element: element('START')
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_2:A',
      'exit:Flow_2:A',
      'enter:SUB:A',
      'createScope:SUB:A',
      'signal:START_SUB:B',
      'exit:START_SUB:B',
      'enter:Flow_4:B',
      'exit:Flow_4:B',
      'enter:TASK_SUB:B',
      'exit:TASK_SUB:B',
      'enter:Flow_1:B',
      'exit:Flow_1:B',
      'enter:END_SUB:B',
      'exit:END_SUB:B',
      'destroyScope:SUB:B',
      'exit:SUB:A',
      'enter:Flow_3:A',
      'exit:Flow_3:A',
      'enter:END:A',
      'exit:END:A',
      'destroyScope:Process_1:A'
    ]);

  });


  verify('boundary-interrupting-sub-process', () => {

    // given
    signal({
      element: element('START')
    });

    // when
    const interruptingBoundary = element('B_RUPTING');

    signal({
      element: interruptingBoundary,
      scope: findScope({ element: interruptingBoundary.parent })
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_4:A',
      'exit:Flow_4:A',
      'enter:SUB:A',
      'createScope:SUB:A',
      'signal:START_SUB:B',
      'exit:START_SUB:B',
      'enter:Flow_3:B',
      'exit:Flow_3:B',
      'enter:CATCH_SUB:B',
      'signal:B_RUPTING:A',
      'destroyScope:SUB:B',
      'exit:B_RUPTING:A',
      'enter:Flow_6:A',
      'exit:Flow_6:A',
      'enter:END_B:A',
      'exit:END_B:A',
      'destroyScope:Process_1:A'
    ]);

  });


  verify('boundary-non-interrupting-sub-process', () => {

    // given
    signal({
      element: element('START')
    });

    // when
    const nonInterruptingBoundary = element('B_NRUPTING');

    signal({
      element: nonInterruptingBoundary,
      scope: findScope({ element: nonInterruptingBoundary.parent })
    });

    // then
    expectTrace([
      'createScope:Process_1:null',
      'signal:START:A',
      'exit:START:A',
      'enter:Flow_4:A',
      'exit:Flow_4:A',
      'enter:SUB:A',
      'createScope:SUB:A',
      'signal:START_SUB:B',
      'exit:START_SUB:B',
      'enter:Flow_3:B',
      'exit:Flow_3:B',
      'enter:CATCH_SUB:B',
      'signal:B_NRUPTING:A',
      'exit:B_NRUPTING:A',
      'enter:Flow_6:A',
      'exit:Flow_6:A',
      'enter:END_B:A',
      'exit:END_B:A'
    ]);

  });

});


function verify(name, test, iit=it) {

  const diagram = require(`./Simulator.${name}.bpmn`);

  describe(name, function() {

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        SimulatorModule,
        {
          __init__: [
            function(simulator, simulationTrace) {
              simulator.on('trace', function(event) {
                simulationTrace.push(event.id);
              });
            }
          ],
          simulationTrace: [ 'value', [] ]
        }
      ]
    }));


    iit('should simulate', test);

  });
}

// eslint-disable-next-line
function verifyOnly(name, test) {
  return verify(name, test, it.only);
}

function signal(...args) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.signal(...args);
  });
}

function setConfig(...args) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.setConfig(...args);
  });
}

function element(id) {
  return getBpmnJS().invoke(function(elementRegistry) {
    const e = elementRegistry.get(id);

    if (!e) {
      throw new Error(`no element <${id}>`);
    }

    return e;
  });
}

function findScope(filter) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.findScope(filter);
  });
}

function expectTrace(expectedTrace) {

  return getBpmnJS().invoke(function(simulationTrace) {
    verifyTrace(simulationTrace, expectedTrace);
  });
}

function verifyTrace(trace, expectedTrace) {
  const scopes = {};

  const adjustedExpectedTrace = [];

  expectedTrace.forEach((event, index) => {
    const split = event.split(':'),
          scope = split[ 2 ];

    if (!scopes[ scope ]) {
      scopes[ scope ] = trace[ index ].split(':')[ 2 ];
    }

    adjustedExpectedTrace.push(
      [ split[ 0 ], split[ 1 ], scopes[ scope ] ].join(':')
    );
  });

  expect(trace).to.eql(adjustedExpectedTrace);
}