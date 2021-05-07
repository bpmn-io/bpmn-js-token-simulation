import { expect } from 'chai';
import SimulatorModule from 'lib/simulator';

import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';


describe('simulator', function() {

  describe('basic scenarios', function() {

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
        'signal:START:A',
        'exit:START:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:CATCH:A'
      ]);

      // but when
      const catchEvent = element('CATCH');

      signal({
        element: catchEvent,
        scope: findScope({
          waitsOnElement: catchEvent
        })
      });

      // then
      expectTrace([
        'signal:CATCH:A',
        'exit:CATCH:A',
        'enter:Flow_2:A',
        'exit:Flow_2:A',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:Process_1:A'
      ]);
    });


    verify('link-event', () => {

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
        'enter:LINK_T:A',
        'exit:LINK_T:A',
        'enter:LINK_C:A',
        'exit:LINK_C:A',
        'enter:Flow_2:A',
        'exit:Flow_2:A',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:Process_1:A'
      ]);

    });

  });


  describe('explicit waitAtElement', function() {

    verify('simple', () => {

      // given
      const task = element('TASK');

      waitAtElement(task);

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
        'enter:TASK:A'
      ]);

      // but when
      signal({
        element: task,
        scope: findScope({
          waitsOnElement: task
        })
      });

      // then
      expectTrace([
        'signal:TASK:A',
        'exit:TASK:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:Process_1:A'
      ]);
    });

  });


  describe('parallel gateways', function() {

    verify('parallel-gateway', () => {

      // when
      signal({
        element: element('START_S')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:START_S:A',
        'exit:START_S:A',
        'enter:Flow_2:A',
        'exit:Flow_2:A',
        'enter:F_GATE:A',
        'exit:F_GATE:A',
        'enter:Flow_3:A',
        'enter:Flow_4:A',
        'enter:Flow_5:A',
        'exit:Flow_3:A',
        'exit:Flow_4:A',
        'exit:Flow_5:A',
        'enter:J_GATE:A',
        'enter:J_GATE:A',
        'enter:J_GATE:A',
        'exit:J_GATE:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:END_S:A',
        'exit:END_S:A',
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

  });


  describe('end events', function() {

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

  });


  describe('sub processes', function() {

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

  });


  describe('boundary events', function() {

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


  describe('message flows', function() {

    verify('message-flow-end-event-trigger-flow', () => {

      // when
      signal({
        element: element('START')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:START:A',
        'exit:START:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:END:A',
        'createScope:COLLAB:null',
        'signal:M_FLOW:B',
        'exit:END:A',
        'destroyScope:PART_EXP:A',
        'exit:M_FLOW:B',
        'destroyScope:COLLAB:B'
      ]);
    });


    verify('message-flow-pool-pool', () => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:COLLAB:null',
        'signal:M_FLOW:A',
        'exit:M_FLOW:A',
        'destroyScope:COLLAB:A'
      ]);
    });


    verify('message-flow-task-trigger-flow', () => {

      // when
      signal({
        element: element('START')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:START:A',
        'exit:START:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:TASK:A',
        'exit:TASK:A',
        'createScope:COLLAB:null',
        'enter:Flow_2:A',
        'signal:M_FLOW:B',
        'exit:Flow_2:A',
        'exit:M_FLOW:B',
        'destroyScope:COLLAB:B',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:PART_EXP:A'
      ]);
    });


    verify('message-flow-trigger-receive-task', () => {

      // given
      signal({
        element: element('START')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:START:A',
        'exit:START:A',
        'enter:Flow_1:A',
        'exit:Flow_1:A',
        'enter:R_TASK:A',
        'createScope:COLLAB:null',
        'signal:M_FLOW:B',
        'exit:M_FLOW:B',
        'destroyScope:COLLAB:B',
        'signal:R_TASK:A',
        'exit:R_TASK:A',
        'enter:Flow_2:A',
        'exit:Flow_2:A',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:PART_EXP:A'
      ]);
    });


    verify('message-flow-trigger-start-event', () => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:COLLAB:null',
        'signal:M_FLOW:A',
        'exit:M_FLOW:A',
        'createScope:PART_EXP:null',
        'destroyScope:COLLAB:A',
        'signal:START:B',
        'exit:START:B',
        'enter:Flow_1:B',
        'exit:Flow_1:B',
        'enter:END:B',
        'exit:END:B',
        'destroyScope:PART_EXP:B'
      ]);
    });


    verify('message-flow-throw-catch-events', () => {

      // when
      signal({
        element: element('START')
      });

      // then
      expectTrace([
        'createScope:PART_A:null',
        'signal:START:A',
        'exit:START:A',
        'enter:Flow_2:A',
        'exit:Flow_2:A',
        'enter:THROW_M:A',
        'exit:THROW_M:A',
        'createScope:COLLAB:null',
        'enter:Flow_7:A',
        'signal:M_FLOW_A:B',
        'exit:Flow_7:A',
        'exit:M_FLOW_A:B',
        'createScope:PART_B:null',
        'destroyScope:COLLAB:B',
        'enter:CATCH_M:A',
        'signal:START_B:C',
        'exit:START_B:C',
        'enter:Flow_3:C',
        'exit:Flow_3:C',
        'enter:END_B:C',
        'createScope:COLLAB:null',
        'signal:M_FLOW_B:D',
        'exit:END_B:C',
        'destroyScope:PART_B:C',
        'exit:M_FLOW_B:D',
        'destroyScope:COLLAB:D',
        'signal:CATCH_M:A',
        'exit:CATCH_M:A',
        'enter:Flow_4:A',
        'exit:Flow_4:A',
        'enter:END:A',
        'exit:END:A',
        'destroyScope:PART_A:A'
      ]);
    });


    verify('message-flow-dependent-processes', () => {

      // when
      signal({
        element: element('START')
      });

      // then
      expectTrace([
        'createScope:PART_A:null',
        'signal:START:bak9lawa3lo9b772sgz0mjtma',
        'exit:START:bak9lawa3lo9b772sgz0mjtma',
        'enter:Flow_2:bak9lawa3lo9b772sgz0mjtma',
        'exit:Flow_2:bak9lawa3lo9b772sgz0mjtma',
        'enter:TASK_S:bak9lawa3lo9b772sgz0mjtma',
        'exit:TASK_S:bak9lawa3lo9b772sgz0mjtma',
        'createScope:COLLAB:null',
        'enter:Flow_1:bak9lawa3lo9b772sgz0mjtma',
        'signal:M_FLOW_A:8kmny5ko194sh3ygo6e9o2x4k',
        'exit:Flow_1:bak9lawa3lo9b772sgz0mjtma',
        'exit:M_FLOW_A:8kmny5ko194sh3ygo6e9o2x4k',
        'createScope:PART_B:null',
        'destroyScope:COLLAB:8kmny5ko194sh3ygo6e9o2x4k',
        'enter:TASK_R:bak9lawa3lo9b772sgz0mjtma',
        'signal:START_B:d6do4a9b0vs72tmj1hjebgz59',
        'exit:START_B:d6do4a9b0vs72tmj1hjebgz59',
        'enter:Flow_3:d6do4a9b0vs72tmj1hjebgz59',
        'exit:Flow_3:d6do4a9b0vs72tmj1hjebgz59',
        'enter:END_B:d6do4a9b0vs72tmj1hjebgz59',
        'createScope:COLLAB:null',
        'signal:M_FLOW_B:9rmn8cw6o52rfjbfkpc3spjep',
        'exit:END_B:d6do4a9b0vs72tmj1hjebgz59',
        'destroyScope:PART_B:d6do4a9b0vs72tmj1hjebgz59',
        'exit:M_FLOW_B:9rmn8cw6o52rfjbfkpc3spjep',
        'destroyScope:COLLAB:9rmn8cw6o52rfjbfkpc3spjep',
        'signal:TASK_R:bak9lawa3lo9b772sgz0mjtma',
        'exit:TASK_R:bak9lawa3lo9b772sgz0mjtma',
        'enter:Flow_4:bak9lawa3lo9b772sgz0mjtma',
        'exit:Flow_4:bak9lawa3lo9b772sgz0mjtma',
        'enter:END:bak9lawa3lo9b772sgz0mjtma',
        'exit:END:bak9lawa3lo9b772sgz0mjtma',
        'destroyScope:PART_A:bak9lawa3lo9b772sgz0mjtma'
      ]);
    });

  });

});


function verify(name, test, iit=it) {

  const diagram = require(`./Simulator.${name}.bpmn`);

  iit(name, async function() {

    let { err, warnings } = await bootstrapModeler(diagram, {
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
          simulationScopes: [ 'value', {} ],
          simulationTrace: [ 'value', [] ]
        }
      ]
    }).call(this);

    if (err) {
      return Promise.reject(err);
    }

    if (warnings.length) {
      err = new Error(
        `found ${warnings.length} import warnings: \n\n${warnings.join('\n----\n')}`);

      return Promise.reject(err);
    }

    getBpmnJS().invoke(test);
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

function waitAtElement(element) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.waitAtElement(element);
  });
}

function findScope(filter) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.findScope(filter);
  });
}

function expectTrace(expectedTrace) {

  return getBpmnJS().invoke(function(simulationTrace, simulationScopes) {

    try {
      verifyTrace(simulationTrace.slice(), expectedTrace, simulationScopes);
    } finally {
      simulationTrace.length = 0;
    }
  });
}

function verifyTrace(trace, expectedTrace, scopes) {
  const adjustedExpectedTrace = [];

  expectedTrace.forEach((event, index) => {
    const split = event.split(':'),
          scope = split[ 2 ];

    if (!scopes[ scope ]) {
      scopes[ scope ] = trace[ index ] ? trace[ index ].split(':')[ 2 ] : scope;
    }

    adjustedExpectedTrace.push(
      [ split[ 0 ], split[ 1 ], scopes[ scope ] ].join(':')
    );
  });

  expect(trace).to.eql(adjustedExpectedTrace);
}