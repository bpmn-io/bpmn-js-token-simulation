import { expect } from 'chai';
import SimulatorModule from 'lib/simulator';

import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';


describe('simulator', function() {

  describe('api', function() {

    verify('sub-process', (simulator) => {

      // when
      const spy = sinon.spy();

      simulator.on('createScope', spy);

      const scope = simulator.createScope(element('Process_1'));

      // then
      expect(scope).to.exist;
      expect(scope.element).to.equal(element('Process_1'));

      expect(spy).to.have.been.calledOnce;

      // but when
      simulator.off('createScope');

      simulator.createScope(element('Process_1'));

      // then
      expect(spy).to.have.been.calledOnce;
    });


    verify('sub-process', (simulator) => {

      // when
      const spy = sinon.spy();

      simulator.on('tick', spy);

      simulator.waitAtElement(element('SUB'));

      // then
      expect(spy).to.have.been.calledOnce;
    });


    verify('sub-process', (simulator) => {

      // when
      const scope = simulator.signal({
        element: element('Process_1')
      });

      // then
      expect(scope).to.exist;
    });

  });


  describe('scopes', function() {

    verify('sub-process', (simulator) => {

      // assume
      expect(
        simulator.findScopes({ destroyed: true })
      ).to.be.empty;

      expect(
        simulator.findScopes({ destroyed: false })
      ).to.be.empty;

      // given
      const rootElement = element('Process_1');
      const subProcess = element('SUB');

      // when
      const rootScope_A = simulator.createScope(rootElement);
      const rootScope_B = simulator.createScope(rootElement);

      const childScope_A1 = simulator.createScope(subProcess, rootScope_A);
      const childScope_A2 = simulator.createScope(subProcess, rootScope_A);

      // then
      expect(
        simulator.findScope({ element: subProcess })
      ).to.equal(childScope_A1);

      expect(rootScope_A.getTokensByElement(subProcess)).to.eql(2);

      expect(rootScope_A.getTokens()).to.eql(2);
      expect(rootScope_B.getTokens()).to.eql(0);

      expect(
        simulator.findScope({ parent: rootScope_A })
      ).to.equal(childScope_A1);

      expect(
        simulator.findScope({ parent: rootScope_B })
      ).not.to.exist;

      expect(
        simulator.findScope({ waitsOnElement: rootScope_A })
      ).not.to.exist;

      expect(
        simulator.findScope({ destroyed: true })
      ).not.to.exist;

      expect(
        simulator.findScope({ destroyed: false })
      ).to.equal(rootScope_A);

      expect(() => {
        const destroyContext = { reason: 'HELLO?' };

        simulator.destroyScope(childScope_A1, destroyContext);
      }).to.throw(/no <context\.initiator> provided/);

      // but when
      simulator.destroyScope(childScope_A1);

      // then
      expect(rootScope_A.getTokensByElement(subProcess)).to.eql(1);
      expect(rootScope_A.getTokens()).to.eql(1);

      expect(
        simulator.findScope({ destroyed: true })
      ).to.equal(childScope_A1);

      expect(
        simulator.findScopes({ destroyed: true })
      ).to.eql([ childScope_A1 ]);

      expect(
        simulator.findScope({ element: subProcess })
      ).to.equal(childScope_A2);

      expect(
        simulator.findScope({ parent: rootScope_A })
      ).to.equal(childScope_A2);

      // but when
      simulator.reset();

      // then
      expect(
        simulator.findScopes({ destroyed: true })
      ).to.be.empty;
    });

  });


  describe('events', function() {

    describe('elementChanged', function() {

      it('should emit on scope creation');

      it('should emit on scope destruction');

      it('should emit on reset');

    });


    describe('scopeChanged', function() {

      it('should emit on scope creation');

      it('should emit on scope destruction');

      it('should emit on reset');

    });

  });


  describe('basic scenarios', function() {

    verify('simple', (fixture) => {

      // given
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('exclusive-gateway-fork-join', (fixture) => {

      // given
      setConfig(element('G_A'), {
        activeOutgoing: element('Flow_2')
      });

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('exclusive-gateway-join', (fixture) => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('task-join', (fixture) => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('catch-event', (fixture) => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture('catch-event-1'));

      // but when
      const catchEvent = element('CATCH');

      signal({
        element: catchEvent,
        scope: findScope({
          element: catchEvent
        })
      });

      // then
      expectTrace(fixture('catch-event-2'));
    });


    verify('link-event', (fixture) => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture());

    });


    verify('data-objects', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-based-gateway', (fixture) => {

      // given
      signal({
        element: element('Process_1')
      });

      // when
      signal({
        element: element('M_CATCH'),
        scope: findScope({
          element: element('G_EVENT')
        })
      });

      // then
      expectTrace(fixture());
    });


    verify('loop', (fixture) => {

      // given
      signal({
        element: element('Process')
      });

      // then
      expectTrace(fixture('loop-0'));

      // but when
      signal({
        element: element('Wait'),
        scope: findScope({
          element: element('Wait')
        })
      });

      // then
      expectTrace(fixture('loop-1'));
    });

  });


  describe('token-sink', function() {

    verify('token-sink-task', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('token-sink-all', () => {

      // when
      const scope = signal({
        element: element('Process_1')
      });

      // then
      expectDestroyed(scope);
    });

  });


  describe('explicit waitAtElement', function() {

    verify('simple', (fixture) => {

      // given
      const task = element('TASK');

      waitAtElement(task);

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture('simple-0'));

      // but when
      signal({
        element: task,
        scope: findScope({
          element: task
        })
      });

      // then
      expectTrace(fixture('simple-1'));
    });

  });


  describe('parallel gateway', function() {

    verify('parallel-gateway', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('parallel-gateway-stuck', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('end event', function() {

    verify('end-event', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('termination', function() {

    verify('terminate', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('terminate-nested-scopes', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('error', function() {

    verify('error-no-catch', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-trigger-event-sub-process', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-trigger-boundary', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-nested-trigger-boundary', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('signal', function() {

    verify('signal-trigger-start-event', (fixture) => {

      // when
      signal({
        element: element('Participant_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-event-based-gateway', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-event-sub-process', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-intermediate-catch-event', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-boundary-event', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-madness', (fixture) => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('escalation', () => {

    verify('escalation-no-catch', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-trigger-boundary-event', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-trigger-event-sub-process', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-boundary-event-event-sub-process-conflict', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('sub-process', function() {

    verify('sub-process', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('event sub-process', function() {

    verify('event-sub-process-interrupting', (fixture) => {

      // given
      const processElement = element('Process_1');

      signal({
        element: processElement
      });

      // when
      const eventSub = element('EVENT_SUB');

      signal({
        element: eventSub,
        parentScope: findScope({
          element: processElement
        })
      });

      // then
      expectTrace(fixture());

    });


    verify('event-sub-process-non-interrupting', (fixture) => {

      // given
      const processElement = element('Process_1');

      signal({
        element: processElement
      });

      // when
      const eventSub = element('EVENT_SUB');

      signal({
        element: eventSub,
        parentScope: findScope({
          element: processElement
        })
      });

      // then
      expectTrace(fixture());

    });


    verify('event-sub-process-cancelation', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-cancelation', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-cancelation-boundary-event', (fixture) => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('boundary events', function() {

    verify('boundary-interrupting-sub-process', (fixture) => {

      // given
      const processElement = element('Process_1');

      signal({
        element: processElement
      });

      // when
      const interruptingBoundary = element('B_RUPTING');

      signal({
        element: interruptingBoundary,
        parentScope: findScope({
          element: processElement
        })
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-non-interrupting-sub-process', (fixture) => {

      // given
      const processElement = element('Process_1');

      signal({
        element: processElement
      });

      // when
      const nonInterruptingBoundary = element('B_NRUPTING');

      signal({
        element: nonInterruptingBoundary,
        parentScope: findScope({
          element: processElement
        })
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-interrupting-task', (fixture) => {

      // given
      const processElement = element('Process_1');

      signal({
        element: processElement
      });

      // when
      signal({
        element: element('B_RUPTING'),
        parentScope: findScope({
          element: processElement
        })
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-non-interrupting-task', (fixture) => {

      // given
      signal({
        element: element('Process_1')
      });

      // when
      const nonInterruptingBoundary = element('B_NRUPTING');

      signal({
        element: nonInterruptingBoundary,
        parentScope: findScope({
          element: nonInterruptingBoundary.parent
        })
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('message flows', function() {

    verify('message-flow-end-event-trigger-flow', (fixture) => {

      // when
      signal({
        element: element('PART_EXP')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-pool-pool', (fixture) => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-task-trigger-flow', (fixture) => {

      // when
      signal({
        element: element('PART_EXP')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-receive-task', (fixture) => {

      // given
      signal({
        element: element('PART_EXP')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-event-based-gateway', (fixture) => {

      // given
      signal({
        element: element('PART_EXP')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-start-event', (fixture) => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-throw-catch-events', (fixture) => {

      // when
      signal({
        element: element('PART_A')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-dependent-processes', (fixture) => {

      // when
      signal({
        element: element('PART_A')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-send-receive', () => {

      // when
      signal({
        element: element('Participant_A')
      });

      // then
      expect(
        findScope({
          element: element('Participant_A'),
          destroyed: true
        })
      ).to.exist;

      expect(
        findScope({
          element: element('Participant_B'),
          destroyed: true
        })
      ).to.exist;
    });


    verify('message-flow-signal-active-participant', (fixture) => {

      // when
      signal({
        element: element('Participant_A')
      });

      // then
      expectTrace(fixture());
    });

  });

});


function verify(name, test, iit=it) {

  const diagram = require(`./Simulator.${name}.bpmn`);

  function fixture(fixtureName=name) {
    const _fixture = require(`./Simulator.${fixtureName}.json`);

    _fixture.name = fixtureName;

    return _fixture;
  }

  iit(name, async function() {

    let { err, warnings } = await bootstrapModeler(diagram, {
      additionalModules: [
        SimulatorModule,
        {
          __init__: [
            function(simulator, simulationTrace) {
              simulator.on('trace', function(event) {
                simulationTrace.push(event);
              });
            }
          ],
          scopeIds: [ 'factory', function() {

            let idx = 0;

            const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

            // generate IDs in alphabetic order;
            // when overflowing the alphabet, attach a numeric runner suffix:
            //
            // A B C D E ... Z A1 B1 C1 ...
            function next() {
              const i = idx++;

              const runner = Math.trunc(i / alphabet.length);
              const char = i % alphabet.length;

              return alphabet[char] + (runner || '');
            }

            return {
              next
            };
          } ],
          simulationScopes: [ 'value', {} ],
          simulationTrace: [ 'value', [] ]
        }
      ]
    }).call(this);

    expect(err).not.to.exist;

    expect(warnings).to.be.empty;

    return getBpmnJS().invoke(test, this, { fixture });
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

function expectDestroyed(scope) {
  expect(scope.destroyed).to.be.true;
}

function expectTrace(expectedTrace) {

  return getBpmnJS().invoke(function(simulationTrace, simulationScopes) {

    try {
      const trace = simulationTrace.slice().map(
        t => [
          t.action,
          t.element && t.element.id || 'null',
          t.scope && t.scope.id || 'null'
        ].join(':')
      );

      verifyTrace(trace, expectedTrace, simulationScopes);
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

  const msg = expectedTrace.name ? `expected trace <${expectedTrace.name}>` : undefined;

  expect(trace).to.eql(adjustedExpectedTrace, msg);
}