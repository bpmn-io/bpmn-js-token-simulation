/* eslint no-bitwise: off */

import SimulatorModule from 'lib/simulator';

import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';

import {
  ScopeTraits
} from 'lib/simulator/ScopeTraits';


describe('simulator', function() {

  describe('api', function() {

    verify('sub-process', (simulator) => {

      // when
      const spy = sinon.spy();

      simulator.on('createScope', spy);

      const scope = simulator.createScope({
        element: element('Process_1')
      });

      // then
      expect(scope).to.exist;
      expect(scope.element).to.equal(element('Process_1'));

      expect(spy).to.have.been.calledOnce;

      // but when
      simulator.off('createScope');

      simulator.createScope({
        element: element('Process_1')
      });

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

      // given
      const subscription = simulator.findSubscription({
        event: element('START')
      });

      // assume
      expect(subscription, 'no subscription').to.exist;

      // when
      const scope = simulator.trigger(subscription);

      // then
      expect(scope, 'no scope').to.exist;
    });


    describe('scopes', function() {

      verify('sub-process', (simulator) => {

        // assume
        expect(
          simulator.findScopes({ trait: ScopeTraits.DESTROYED })
        ).to.be.empty;

        expect(
          simulator.findScopes({ })
        ).to.be.empty;

        // given
        const rootElement = element('Process_1');
        const subProcess = element('SUB');

        // when
        const rootScope_A = simulator.createScope({
          element: rootElement
        });
        const rootScope_B = simulator.createScope({
          element: rootElement
        });

        const childScope_A1 = simulator.createScope({
          element: subProcess,
          parent: rootScope_A
        });
        const childScope_A2 = simulator.createScope({
          element: subProcess,
          parent: rootScope_A
        });

        // then
        expect(
          simulator.findScope({ element: subProcess })
        ).not.to.exist;

        expect(
          simulator.findScope({ element: subProcess, trait: ScopeTraits.ACTIVATED })
        ).to.equal(childScope_A1);

        // but when
        rootScope_A.start();
        rootScope_B.start();

        childScope_A1.start();
        childScope_A2.start();

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
          simulator.findScope({ trait: ScopeTraits.DESTROYED })
        ).not.to.exist;

        expect(
          simulator.findScope({ trait: ScopeTraits.ENDING })
        ).not.to.exist;

        expect(
          simulator.findScope({ trait: ScopeTraits.ENDING | ScopeTraits.DESTROYED })
        ).not.to.exist;

        expect(
          simulator.findScope({ trait: ScopeTraits.RUNNING })
        ).to.equal(rootScope_A);

        // but when
        childScope_A1.complete();

        expect(
          simulator.findScope({ trait: ScopeTraits.ENDING })
        ).to.equal(childScope_A1);

        // but when
        simulator.destroyScope(childScope_A1);

        // then
        expect(
          simulator.findScope({ trait: ScopeTraits.ENDING })
        ).not.to.exist;

        expect(rootScope_A.getTokensByElement(subProcess)).to.eql(1);
        expect(rootScope_A.getTokens()).to.eql(1);

        // destroyed scopes are not kept around
        expect(
          simulator.findScope({
            trait: ScopeTraits.DESTROYED
          })
        ).not.to.exist;

        expect(
          simulator.findScopes({ trait: ScopeTraits.DESTROYED })
        ).to.be.empty;

        expect(
          simulator.findScope({ element: subProcess })
        ).to.equal(childScope_A2);

        expect(
          simulator.findScope({ parent: rootScope_A })
        ).to.equal(childScope_A2);

        // destroyed scope not kept around
        expect(
          simulator.findScopes({
            trait: ScopeTraits.RUNNING | ScopeTraits.ENDING | ScopeTraits.DESTROYED
          })
        ).to.have.length(3);

        // but when
        simulator.destroyScope(rootScope_A);

        // destroyed scope not kept around
        expect(
          simulator.findScopes({
            trait: ScopeTraits.DESTROYED
          })
        ).to.be.empty;

        // but when
        simulator.reset();

        // then
        expect(
          simulator.findScopes({
            trait: ScopeTraits.DESTROYED
          })
        ).to.be.empty;
      });


      verify('sub-process', (simulator) => {

        // given
        const subscribeSpy = sinon.spy();

        const scope = simulator.createScope({
          element: element('Process_1')
        });

        const otherScopes = [
          simulator.createScope({
            element: element('Process_1')
          }),
          simulator.createScope({
            element: element('Process_1')
          })
        ];

        // when
        const event = simulator.waitForScopes(scope, otherScopes);

        // then
        expect(event).to.exist;

        // but when
        simulator.subscribe(scope, event, subscribeSpy);

        simulator.destroyScope(otherScopes[0]);

        // then
        expect(subscribeSpy).not.to.have.been.called;

        // but when
        simulator.destroyScope(otherScopes[1]);

        // then
        expect(subscribeSpy).to.have.been.calledOnce;
      });

    });


    describe('subscriptions', function() {

      verify('sub-process', (simulator) => {

        // given
        const sub = element('SUB');

        // assume
        expect(
          simulator.findSubscriptions({
            element: element('START')
          })
        ).to.have.length(1);

        // when
        simulator.waitAtElement(sub);

        // then
        expect(
          simulator.findSubscriptions({})
        ).to.have.length(1);

        // but when
        trigger({
          element: element('START')
        });

        // then
        expect(
          simulator.findSubscriptions({})
        ).to.have.length(2);

        expect(
          simulator.findSubscriptions({
            element: sub
          })
        ).to.have.length(1);

        const continueSub = simulator.findSubscription({
          element: sub
        });

        expect(continueSub).to.exist;

        expect(
          simulator.findSubscription({
            element: element('START')
          })
        ).to.exist;

        // but when
        trigger(continueSub);

        // then
        expectTrace([
          'createScope:Process_1:null',
          'signal:Process_1:B',
          'createScope:START:B',
          'signal:START:C',
          'exit:START:C',
          'createScope:Flow_2:B',
          'destroyScope:START:C',
          'enter:Flow_2:B',
          'exit:Flow_2:D',
          'createScope:SUB:B',
          'destroyScope:Flow_2:D',
          'enter:SUB:B',
          'signal:SUB:E',
          'createScope:START_SUB:E',
          'signal:START_SUB:F',
          'exit:START_SUB:F',
          'createScope:Flow_4:E',
          'destroyScope:START_SUB:F',
          'enter:Flow_4:E',
          'exit:Flow_4:G',
          'createScope:TASK_SUB:E',
          'destroyScope:Flow_4:G',
          'enter:TASK_SUB:E',
          'exit:TASK_SUB:H',
          'createScope:Flow_1:E',
          'destroyScope:TASK_SUB:H',
          'enter:Flow_1:E',
          'exit:Flow_1:I',
          'createScope:END_SUB:E',
          'destroyScope:Flow_1:I',
          'enter:END_SUB:E',
          'exit:END_SUB:J',
          'destroyScope:END_SUB:J',
          'exit:SUB:E',
          'createScope:Flow_3:B',
          'destroyScope:SUB:E',
          'enter:Flow_3:B',
          'exit:Flow_3:K',
          'createScope:END:B',
          'destroyScope:Flow_3:K',
          'enter:END:B',
          'exit:END:L',
          'destroyScope:END:L',
          'exit:Process_1:B',
          'destroyScope:Process_1:B'
        ]);
      });

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
      trigger({
        element: element('START')
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
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('exclusive-gateway-join', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('exclusive-gateway-no-outgoings', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('task-join', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('catch-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture('catch-event-1'));

      // but when
      const catchEvent = element('CATCH');

      trigger({
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
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('data-objects', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('loop', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture('loop-0'));

      // but when
      trigger({
        element: element('Wait')
      });

      // then
      expectTrace(fixture('loop-1'));
    });

  });


  describe('event-based-gateway', function() {

    verify('event-based-gateway', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('M_CATCH')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-based-gateway-same-events', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('WAIT_B')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('token-sink', function() {

    verify('token-sink-task', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('token-sink-all', () => {

      // when
      const [ scope ] = trigger({
        element: element('START')
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
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture('simple-0'));

      // but when
      trigger({
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
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('parallel-gateway-stuck', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('parallel-gateway-join', (fixture) => {

      // given
      const task = element('Activity_1');

      waitAtElement(task);

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('Timer_1')
      });

      trigger({
        element: element('Activity_1')
      });

      // then
      expectTrace(fixture('parallel-gateway-join-1'));
    });


    verify('parallel-gateway-join', (fixture) => {

      // given
      const task = element('Activity_1');

      waitAtElement(task);

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('Timer_1')
      });

      trigger({
        element: element('Timer_1')
      });

      // then
      expectTrace(fixture('parallel-gateway-join-2'));
    });


    verify('parallel-gateway-join', (fixture) => {

      // given
      const task = element('Activity_1');

      waitAtElement(task);

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('Activity_1')
      });

      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('Timer_1')
      });

      // then
      expectTrace(fixture('parallel-gateway-join-3'));
    });

  });


  describe('inclusive gateway', function() {

    verify('inclusive-gateway-sync', (fixture) => {

      // given
      setConfig(element('F_GATE'), {
        activeOutgoing: [ element('Flow_3'), element('Flow_5') ]
      });

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-single-token-pass-through', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-default-flow', (fixture) => {

      // given
      setConfig(element('F_GATE'), {
        activeOutgoing: [ element('Flow_4') ]
      });

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-fork-join', (fixture) => {

      // given
      setConfig(element('INC_FORK'), {
        activeOutgoing: [ element('Flow_2'), element('Flow_3') ]
      });

      setConfig(element('INC_FORK_JOIN'), {
        activeOutgoing: [ element('Flow_4'), element('Flow_5') ]
      });

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-no-outgoings', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    // separate executions don't interfere with each other
    verify('inclusive-gateway-multiple-starts', (fixture) => {

      // given
      setConfig(element('F_GATE'), {
        activeOutgoing: [
          element('Flow_3'),
          element('Flow_4'),
          element('Flow_5')
        ]
      });
      waitAtElement(element('PausedActivity'));

      // when
      trigger({
        element: element('START')
      });
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    // inclusive gateway continues execution when
    // token is consumed via boundary event
    verify('inclusive-gateway-boundary-event', (fixture) => {

      // given
      setConfig(element('F_GATE'), {
        activeOutgoing: [
          element('Flow_3'),
          element('Flow_4'),
          element('Flow_5')
        ]
      });
      waitAtElement(element('PausedActivity'));
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('TimerEvent'),
        scope: findScope({
          element: element('PausedActivity')
        })
      });

      // then
      expectTrace(fixture());
    });


    // inclusive gateway continues execution when
    // token gets out of reach via an exclusive gateway
    verify('inclusive-gateway-exclusive-gateway', (fixture) => {

      // given
      setConfig(element('ExclusiveGateway'), {
        activeOutgoing: element('Flow_7')
      });

      trigger({
        element: element('StartEvent_1')
      });

      // when
      trigger({
        element: element('TimerEvent')
      });

      // then
      expectTrace(fixture());
    });


    // inclusive gateway waits for all tokens to arrive
    verify('inclusive-gateway-multiple-elements', (fixture) => {

      // given
      setConfig(element('F_GATE'), {
        activeOutgoing: [
          element('Flow_3'),
          element('Flow_4'),
          element('Flow_5')
        ]
      });

      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('Timer_1'),
        scope: findScope({
          element: element('Timer_1')
        })
      });

      trigger({
        element: element('Timer_2'),
        scope: findScope({
          element: element('Timer_2')
        })
      });

      // then
      expectTrace(fixture());
    });


    // inclusive gateway doesn't wait for tokens
    // on flows that have already been activated
    verify('inclusive-gateway-incoming-flow-taken', (fixture) => {

      // given
      setConfig(element('ExclusiveGateway'), {
        activeOutgoing: element('Flow_4')
      });

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('MessageEvent')
      });

      // then
      expectTrace(fixture());
    });


    // single incoming flow should always activate
    verify('inclusive-gateway-single-incoming', (fixture) => {

      // given
      setConfig(element('InclusiveGateway'), {
        activeOutgoing: [
          element('Flow_7')
        ]
      });

      trigger({
        element: element('StartEvent_1')
      });

      // when
      trigger({
        element: element('TimerEvent')
      });

      trigger({
        element: element('TimerEvent')
      });

      // then
      expectTrace(fixture());
    });


    // a single token can result in multiple activations
    verify('inclusive-gateway-multiple-activation', (fixture) => {

      // given
      waitAtElement(element('Task_A'));

      trigger({
        element: element('StartEvent_1')
      });

      // when
      trigger({
        element: element('BoundaryMessage')
      });

      trigger({
        element: element('BoundaryMessage')
      });

      trigger({
        element: element('Task_A')
      });

      // then
      expectTrace(fixture());
    });


    // only consider token that do not visit the gateway
    verify('inclusive-gateway-visiting-token', (fixture) => {

      // given
      setConfig(element('ExclusiveGateway'), {
        activeOutgoing: element('Flow_2')
      });

      setConfig(element('InclusiveGateway_Split'), {
        activeOutgoing: [
          element('Flow_3'),
          element('Flow_4')
        ]
      });

      trigger({
        element: element('StartEvent_1')
      });

      // when
      setConfig(element('ExclusiveGateway'), {
        activeOutgoing: element('Flow_7')
      });

      trigger({
        element: element('TimerEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-link-event', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('TimerEvent')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-link-collapsed-subprocess', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_0')
      });

      trigger({
        element: element('TimerEvent')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-link-missing', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('TimerEvent')
      });

      // then
      expectTrace(fixture());
    });


    verify('inclusive-gateway-multiple-link-events', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      trigger({
        element: element('TimerEvent_1')
      });

      trigger({
        element: element('TimerEvent_2')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('end event', function() {

    verify('end-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('termination', function() {

    verify('terminate', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('terminate-nested-scopes', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('error', function() {

    verify('error-no-catch', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-trigger-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-trigger-boundary', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-nested-trigger-boundary', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-consume', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-rethrow', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-catch-all-inner-event-sub-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-catch-all-inner-event-sub-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-catch-all-boundary-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('error-catch-all-boundary-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-outer-event-sub-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-outer-event-sub-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('signal', function() {

    verify('signal-trigger-start-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-multiple-start-events', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-event-based-gateway', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-end-event-trigger-sub-process-non-interrupting', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-end-event-trigger-event-sub-process-interrupting', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-intermediate-catch-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-trigger-boundary-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-madness', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-consume', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('signal-rethrow', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('escalation', function() {

    verify('escalation-no-catch', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-trigger-boundary-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-trigger-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-consume', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-rethrow', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-inner-event-sub-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-inner-event-sub-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-boundary-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-boundary-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-outer-event-sub-ref', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('escalation-catch-all-outer-event-sub-none', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('process', function() {

    verify('process-multiple-starts', (fixture) => {

      // when
      trigger({
        element: element('START_1')
      });

      // then
      expectTrace(fixture('process-multiple-starts-1'));

      // but when
      trigger({
        element: element('START_2')
      });

      // then
      expectTrace(fixture('process-multiple-starts-2'));
    });


    verify('process-implicit-start-no-start-events', (fixture) => {

      // when
      trigger({
        element: element('TASK')
      });


      // then
      expectTrace(fixture());
    });


    verify('process-implicit-start-none-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });


      // then
      expectTrace(fixture());
    });


    verify('process-implicit-start-trigger', (fixture) => {

      // when
      trigger({
        element: element('MESSAGE_START')
      });


      // then
      expectTrace(fixture());
    });


    verify('process-implicit-start-collaboration', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());

      // but when
      trigger({
        element: element('MESSAGE_THROW')
      });

      // then
      expectTrace(fixture('process-implicit-start-collaboration-message-trigger'));
    });

  });


  describe('sub-process', function() {

    verify('sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('sub-process-multiple-starts', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('collapsed-sub-process-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('collapsed-sub-process-compensation-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('collapsed-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('collapsed-compensation-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('collapsed-sub-process-link-events', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });


    verify('sub-process-empty-continuation', (fixture) => {

      // when
      trigger({
        element: element('StartEvent_1')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('transaction', function() {

    verify('transaction-cancel-trigger-cancel-boundary', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('transaction-compensation', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('transaction-no-compensate-activity', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('transaction-compensation-multiple', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verifySkip('transaction-cancel-from-nested-scope', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('transaction-terminate', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('transaction-error', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('compensation', function() {

    verify('compensation-booking', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-once', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-intermediate-throw', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-end', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-nested-event-sub-process', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-error', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-no-compensate-activity', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-nested', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-after-error-recovery', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('compensation-after-escalation-recovery', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('event sub-process', function() {

    verify('event-sub-process-interrupting', (fixture) => {

      // given
      const [ scope ] = trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('START_SUB'),
        scope
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-non-interrupting', (fixture) => {

      // given
      const [ scope ] = trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('START_SUB'),
        scope
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-cancelation', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-cancelation-absorb-event', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-cancelation-rethrow', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-cancelation-throws-error', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });



    verify('event-sub-process-nested-cancelation-throws-escalation', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-nested-interrupting-non-interrupting-boundary', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-multiple-starts', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('event-sub-process-implicit-start', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('boundary events', function() {

    verify('boundary-interrupting-sub-process', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('B_RUPTING')
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-non-interrupting-sub-process', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('B_NRUPTING'),
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-interrupting-task', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('B_RUPTING')
      });

      // then
      expectTrace(fixture());
    });


    verify('boundary-non-interrupting-task', (fixture) => {

      // given
      trigger({
        element: element('START')
      });

      // when
      trigger({
        element: element('B_NRUPTING')
      });

      // then
      expectTrace(fixture());
    });

  });


  describe('message flows', function() {

    verify('message-flow-end-event-trigger-flow', (fixture) => {

      // when
      trigger({
        element: element('START')
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
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-receive-task', (fixture) => {

      // given
      trigger({
        element: element('START')
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
      trigger({
        element: element('START')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-event-based-gateway-multiple-events', (fixture) => {

      // given
      trigger({
        element: element('START')
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


    verify('message-flow-trigger-start-multiple-events', (fixture) => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-trigger-start-multiple-message-events', (fixture) => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-throw-catch-events', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-send-receive-tasks', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });


    verify('message-flow-send-receive', () => {

      // when
      const [ scope ] = trigger({
        element: element('START')
      });

      // then
      expect(scope.destroyed).to.be.true;

      expect(
        findScope({})
      ).not.to.exist;
    });


    verify('message-flow-signal-active-participant', (fixture) => {

      // when
      trigger({
        element: element('START')
      });

      // then
      expectTrace(fixture());
    });

  });

});


function verify(name, test, iit = it) {

  const diagram = require(`./Simulator.${name}.bpmn`);

  function fixture(fixtureName = name) {
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
            },
            function(eventBus, simulator) {
              eventBus.once('import.done', () => {
                simulator.reset();
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


function verifySkip(name, test) {
  return verify(name, test, it.skip);
}

function subscription(options) {
  return getBpmnJS().invoke(function(simulator) {
    return simulator.findSubscription(options);
  });
}

function trigger(options) {

  return getBpmnJS().invoke(function(simulator) {

    const s = subscription(options);

    expect(s, 'subscription does not exist').to.exist;

    return simulator.trigger(s);
  });
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
    const e = typeof id === 'string' ? elementRegistry.get(id) : id;

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
