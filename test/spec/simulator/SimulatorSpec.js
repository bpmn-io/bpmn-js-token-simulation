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

    verify('simple', () => {

      // given
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1h9nnt7',
        'createScope:START:1h9nnt7',
        'signal:START:1g0b67t',
        'exit:START:1g0b67t',
        'createScope:Flow_2:1h9nnt7',
        'destroyScope:START:1g0b67t',
        'enter:Flow_2:1h9nnt7',
        'exit:Flow_2:0fcfa3x',
        'createScope:TASK:1h9nnt7',
        'destroyScope:Flow_2:0fcfa3x',
        'enter:TASK:1h9nnt7',
        'exit:TASK:1652tfj',
        'createScope:Flow_1:1h9nnt7',
        'destroyScope:TASK:1652tfj',
        'enter:Flow_1:1h9nnt7',
        'exit:Flow_1:1vu5u2u',
        'createScope:END:1h9nnt7',
        'destroyScope:Flow_1:1vu5u2u',
        'enter:END:1h9nnt7',
        'exit:END:13swzq0',
        'destroyScope:END:13swzq0',
        'exit:Process_1:1h9nnt7',
        'destroyScope:Process_1:1h9nnt7'
      ]);
    });


    verify('exclusive-gateway-fork-join', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1w3kmjk',
        'createScope:START:1w3kmjk',
        'signal:START:1hxahns',
        'exit:START:1hxahns',
        'createScope:Flow_1:1w3kmjk',
        'destroyScope:START:1hxahns',
        'enter:Flow_1:1w3kmjk',
        'exit:Flow_1:1tp37tz',
        'createScope:G_A:1w3kmjk',
        'destroyScope:Flow_1:1tp37tz',
        'enter:G_A:1w3kmjk',
        'exit:G_A:01tuc5y',
        'createScope:Flow_2:1w3kmjk',
        'destroyScope:G_A:01tuc5y',
        'enter:Flow_2:1w3kmjk',
        'exit:Flow_2:1vmoduu',
        'createScope:G_B:1w3kmjk',
        'destroyScope:Flow_2:1vmoduu',
        'enter:G_B:1w3kmjk',
        'exit:G_B:0xfgmi1',
        'createScope:Flow_4:1w3kmjk',
        'destroyScope:G_B:0xfgmi1',
        'enter:Flow_4:1w3kmjk',
        'exit:Flow_4:19jddme',
        'createScope:END:1w3kmjk',
        'destroyScope:Flow_4:19jddme',
        'enter:END:1w3kmjk',
        'exit:END:0ui1s69',
        'destroyScope:END:0ui1s69',
        'exit:Process_1:1w3kmjk',
        'destroyScope:Process_1:1w3kmjk'
      ]);
    });


    verify('exclusive-gateway-join', () => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0i7boji',
        'createScope:START:0i7boji',
        'signal:START:0hc8yzk',
        'exit:START:0hc8yzk',
        'createScope:Flow_2:0i7boji',
        'destroyScope:START:0hc8yzk',
        'enter:Flow_2:0i7boji',
        'exit:Flow_2:0107cam',
        'createScope:GATE:0i7boji',
        'destroyScope:Flow_2:0107cam',
        'enter:GATE:0i7boji',
        'exit:GATE:0v7hr6a',
        'createScope:Flow_1:0i7boji',
        'destroyScope:GATE:0v7hr6a',
        'enter:Flow_1:0i7boji',
        'exit:Flow_1:0ra8bk2',
        'createScope:END:0i7boji',
        'destroyScope:Flow_1:0ra8bk2',
        'enter:END:0i7boji',
        'exit:END:0rzjj3p',
        'destroyScope:END:0rzjj3p',
        'exit:Process_1:0i7boji',
        'destroyScope:Process_1:0i7boji'
      ]);
    });


    verify('task-join', () => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0ei7bnu',
        'createScope:START:0ei7bnu',
        'signal:START:1y4cd9g',
        'exit:START:1y4cd9g',
        'createScope:Flow_2:0ei7bnu',
        'createScope:Flow_4:0ei7bnu',
        'destroyScope:START:1y4cd9g',
        'enter:Flow_2:0ei7bnu',
        'enter:Flow_4:0ei7bnu',
        'exit:Flow_2:0j1kklc',
        'createScope:TASK:0ei7bnu',
        'destroyScope:Flow_2:0j1kklc',
        'exit:Flow_4:1pzh4kz',
        'createScope:TASK:0ei7bnu',
        'destroyScope:Flow_4:1pzh4kz',
        'enter:TASK:0ei7bnu',
        'enter:TASK:0ei7bnu',
        'exit:TASK:18b9idm',
        'createScope:Flow_3:0ei7bnu',
        'destroyScope:TASK:18b9idm',
        'exit:TASK:067njez',
        'createScope:Flow_3:0ei7bnu',
        'destroyScope:TASK:067njez',
        'enter:Flow_3:0ei7bnu',
        'enter:Flow_3:0ei7bnu',
        'exit:Flow_3:1h87iys',
        'createScope:END:0ei7bnu',
        'destroyScope:Flow_3:1h87iys',
        'exit:Flow_3:0jido76',
        'createScope:END:0ei7bnu',
        'destroyScope:Flow_3:0jido76',
        'enter:END:0ei7bnu',
        'enter:END:0ei7bnu',
        'exit:END:1fb2rqv',
        'destroyScope:END:1fb2rqv',
        'exit:END:1ih86mo',
        'destroyScope:END:1ih86mo',
        'exit:Process_1:0ei7bnu',
        'destroyScope:Process_1:0ei7bnu'
      ]);
    });


    verify('catch-event', () => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0pgqzcd',
        'createScope:START:0pgqzcd',
        'signal:START:02qoaab',
        'exit:START:02qoaab',
        'createScope:Flow_1:0pgqzcd',
        'destroyScope:START:02qoaab',
        'enter:Flow_1:0pgqzcd',
        'exit:Flow_1:1mtm8jo',
        'createScope:CATCH:0pgqzcd',
        'destroyScope:Flow_1:1mtm8jo',
        'enter:CATCH:0pgqzcd'
      ]);

      // but when
      const catchEvent = element('CATCH');

      signal({
        element: catchEvent,
        scope: findScope({
          element: catchEvent
        })
      });

      // then
      expectTrace([
        'signal:CATCH:1n9colu',
        'exit:CATCH:1n9colu',
        'createScope:Flow_2:0pgqzcd',
        'destroyScope:CATCH:1n9colu',
        'enter:Flow_2:0pgqzcd',
        'exit:Flow_2:18o9s7k',
        'createScope:END:0pgqzcd',
        'destroyScope:Flow_2:18o9s7k',
        'enter:END:0pgqzcd',
        'exit:END:1aa23s7',
        'destroyScope:END:1aa23s7',
        'exit:Process_1:0pgqzcd',
        'destroyScope:Process_1:0pgqzcd'
      ]);
    });


    verify('link-event', () => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0okaali',
        'createScope:START:0okaali',
        'signal:START:0p9ukwk',
        'exit:START:0p9ukwk',
        'createScope:Flow_1:0okaali',
        'destroyScope:START:0p9ukwk',
        'enter:Flow_1:0okaali',
        'exit:Flow_1:0pohwmn',
        'createScope:LINK_T:0okaali',
        'destroyScope:Flow_1:0pohwmn',
        'enter:LINK_T:0okaali',
        'createScope:LINK_C:0okaali',
        'enter:LINK_C:0okaali',
        'exit:LINK_T:05u8fo1',
        'destroyScope:LINK_T:05u8fo1',
        'exit:LINK_C:0zp9xr7',
        'createScope:Flow_2:0okaali',
        'destroyScope:LINK_C:0zp9xr7',
        'enter:Flow_2:0okaali',
        'exit:Flow_2:0w5r4bl',
        'createScope:END:0okaali',
        'destroyScope:Flow_2:0w5r4bl',
        'enter:END:0okaali',
        'exit:END:16w744i',
        'destroyScope:END:16w744i',
        'exit:Process_1:0okaali',
        'destroyScope:Process_1:0okaali'
      ]);

    });


    verify('data-objects', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:15qsuro',
        'createScope:START:15qsuro',
        'signal:START:113bdv2',
        'exit:START:113bdv2',
        'createScope:Flow_1:15qsuro',
        'destroyScope:START:113bdv2',
        'enter:Flow_1:15qsuro',
        'exit:Flow_1:0cuhdzv',
        'createScope:TASK_A:15qsuro',
        'destroyScope:Flow_1:0cuhdzv',
        'enter:TASK_A:15qsuro',
        'exit:TASK_A:1xf8rr5',
        'createScope:Flow_2:15qsuro',
        'destroyScope:TASK_A:1xf8rr5',
        'enter:Flow_2:15qsuro',
        'exit:Flow_2:1wz5wbo',
        'createScope:TASK_B:15qsuro',
        'destroyScope:Flow_2:1wz5wbo',
        'enter:TASK_B:15qsuro',
        'exit:TASK_B:17ofnq5',
        'createScope:Flow_3:15qsuro',
        'destroyScope:TASK_B:17ofnq5',
        'enter:Flow_3:15qsuro',
        'exit:Flow_3:0sfb77v',
        'createScope:END:15qsuro',
        'destroyScope:Flow_3:0sfb77v',
        'enter:END:15qsuro',
        'exit:END:0k5k6py',
        'destroyScope:END:0k5k6py',
        'exit:Process_1:15qsuro',
        'destroyScope:Process_1:15qsuro'
      ]);
    });


    verify('event-based-gateway', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:10e86bk',
        'createScope:START:10e86bk',
        'signal:START:1k6c4wo',
        'exit:START:1k6c4wo',
        'createScope:Flow_1:10e86bk',
        'destroyScope:START:1k6c4wo',
        'enter:Flow_1:10e86bk',
        'exit:Flow_1:09e71v5',
        'createScope:G_EVENT:10e86bk',
        'destroyScope:Flow_1:09e71v5',
        'enter:G_EVENT:10e86bk',
        'signal:M_CATCH:1vtrr9g',
        'exit:M_CATCH:1vtrr9g',
        'createScope:Flow_4:10e86bk',
        'destroyScope:G_EVENT:1vtrr9g',
        'enter:Flow_4:10e86bk',
        'exit:Flow_4:0p36nzn',
        'createScope:END_A:10e86bk',
        'destroyScope:Flow_4:0p36nzn',
        'enter:END_A:10e86bk',
        'exit:END_A:11av813',
        'destroyScope:END_A:11av813',
        'exit:Process_1:10e86bk',
        'destroyScope:Process_1:10e86bk'
      ]);
    });


    verify('loop', () => {

      // given
      signal({
        element: element('Process')
      });

      // then
      expectTrace([
        'createScope:Process:null',
        'signal:Process:A',
        'createScope:Start:A',
        'signal:Start:B',
        'exit:Start:B',
        'createScope:Flow_1:A',
        'destroyScope:Start:B',
        'enter:Flow_1:A',
        'exit:Flow_1:C',
        'createScope:Join:A',
        'destroyScope:Flow_1:C',
        'enter:Join:A',
        'exit:Join:D',
        'createScope:Flow_3:A',
        'destroyScope:Join:D',
        'enter:Flow_3:A',
        'exit:Flow_3:E',
        'createScope:Split:A',
        'destroyScope:Flow_3:E',
        'enter:Split:A',
        'exit:Split:F',
        'createScope:Flow_2:A',
        'createScope:Flow_4:A',
        'destroyScope:Split:F',
        'enter:Flow_2:A',
        'enter:Flow_4:A',
        'exit:Flow_2:G',
        'createScope:End:A',
        'destroyScope:Flow_2:G',
        'exit:Flow_4:H',
        'createScope:Wait:A',
        'destroyScope:Flow_4:H',
        'enter:End:A',
        'enter:Wait:A',
        'exit:End:I',
        'destroyScope:End:I'
      ]);

      // but when
      signal({
        element: element('Wait'),
        scope: findScope({
          element: element('Wait')
        })
      });

      // then
      expectTrace([
        'signal:Wait:J',
        'exit:Wait:J',
        'createScope:Flow_5:A',
        'destroyScope:Wait:J',
        'enter:Flow_5:A',
        'exit:Flow_5:K',
        'createScope:Join:A',
        'destroyScope:Flow_5:K',
        'enter:Join:A',
        'exit:Join:L',
        'createScope:Flow_3:A',
        'destroyScope:Join:L',
        'enter:Flow_3:A',
        'exit:Flow_3:M',
        'createScope:Split:A',
        'destroyScope:Flow_3:M',
        'enter:Split:A',
        'exit:Split:N',
        'createScope:Flow_2:A',
        'createScope:Flow_4:A',
        'destroyScope:Split:N',
        'enter:Flow_2:A',
        'enter:Flow_4:A',
        'exit:Flow_2:O',
        'createScope:End:A',
        'destroyScope:Flow_2:O',
        'exit:Flow_4:P',
        'createScope:Wait:A',
        'destroyScope:Flow_4:P',
        'enter:End:A',
        'enter:Wait:A',
        'exit:End:Q',
        'destroyScope:End:Q'
      ]);

    });

  });


  describe('token-sink', function() {

    verify('token-sink-task', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:A',
        'createScope:Start:A',
        'signal:Start:B',
        'exit:Start:B',
        'createScope:Flow_1:A',
        'destroyScope:Start:B',
        'enter:Flow_1:A',
        'exit:Flow_1:C',
        'createScope:EndTask:A',
        'destroyScope:Flow_1:C',
        'enter:EndTask:A',
        'exit:EndTask:D',
        'destroyScope:EndTask:D',
        'exit:Process_1:A',
        'destroyScope:Process_1:A'
      ]);
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

    verify('simple', () => {

      // given
      const task = element('TASK');

      waitAtElement(task);

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0w70imz',
        'createScope:START:0w70imz',
        'signal:START:1mo8ftr',
        'exit:START:1mo8ftr',
        'createScope:Flow_2:0w70imz',
        'destroyScope:START:1mo8ftr',
        'enter:Flow_2:0w70imz',
        'exit:Flow_2:02ff4ym',
        'createScope:TASK:0w70imz',
        'destroyScope:Flow_2:02ff4ym',
        'enter:TASK:0w70imz'
      ]);

      // but when
      signal({
        element: task,
        scope: findScope({
          element: task
        })
      });

      // then
      expectTrace([
        'signal:TASK:07uy7vw',
        'exit:TASK:07uy7vw',
        'createScope:Flow_1:1h9ifl8',
        'destroyScope:TASK:07uy7vw',
        'enter:Flow_1:1h9ifl8',
        'exit:Flow_1:00vrnkn',
        'createScope:END:1h9ifl8',
        'destroyScope:Flow_1:00vrnkn',
        'enter:END:1h9ifl8',
        'exit:END:0ekvc6i',
        'destroyScope:END:0ekvc6i',
        'exit:Process_1:1h9ifl8',
        'destroyScope:Process_1:1h9ifl8'
      ]);
    });

  });


  describe('parallel gateway', function() {

    verify('parallel-gateway', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1863y4x',
        'createScope:START_S:1863y4x',
        'signal:START_S:06kgqgb',
        'exit:START_S:06kgqgb',
        'createScope:Flow_2:1863y4x',
        'destroyScope:START_S:06kgqgb',
        'enter:Flow_2:1863y4x',
        'exit:Flow_2:14gac13',
        'createScope:F_GATE:1863y4x',
        'destroyScope:Flow_2:14gac13',
        'enter:F_GATE:1863y4x',
        'exit:F_GATE:0g64u6n',
        'createScope:Flow_3:1863y4x',
        'createScope:Flow_4:1863y4x',
        'createScope:Flow_5:1863y4x',
        'destroyScope:F_GATE:0g64u6n',
        'enter:Flow_3:1863y4x',
        'enter:Flow_4:1863y4x',
        'enter:Flow_5:1863y4x',
        'exit:Flow_3:1a2feby',
        'createScope:J_GATE:1863y4x',
        'destroyScope:Flow_3:1a2feby',
        'exit:Flow_4:18o1dd2',
        'createScope:J_GATE:1863y4x',
        'destroyScope:Flow_4:18o1dd2',
        'exit:Flow_5:1iikp0l',
        'createScope:J_GATE:1863y4x',
        'destroyScope:Flow_5:1iikp0l',
        'enter:J_GATE:1863y4x',
        'destroyScope:J_GATE:0r98p50',
        'destroyScope:J_GATE:161dmoi',
        'exit:J_GATE:0mc6bsm',
        'createScope:Flow_1:1863y4x',
        'destroyScope:J_GATE:0mc6bsm',
        'enter:Flow_1:1863y4x',
        'exit:Flow_1:0g4tjxq',
        'createScope:END_S:1863y4x',
        'destroyScope:Flow_1:0g4tjxq',
        'enter:END_S:1863y4x',
        'exit:END_S:0j4xzj4',
        'destroyScope:END_S:0j4xzj4',
        'exit:Process_1:1863y4x',
        'destroyScope:Process_1:1863y4x'
      ]);
    });


    verify('parallel-gateway-stuck', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1g3ti83',
        'createScope:START:1g3ti83',
        'signal:START:1qopt3k',
        'exit:START:1qopt3k',
        'createScope:Flow_2:1g3ti83',
        'destroyScope:START:1qopt3k',
        'enter:Flow_2:1g3ti83',
        'exit:Flow_2:0m7s1dn',
        'createScope:GATE:1g3ti83',
        'destroyScope:Flow_2:0m7s1dn',
        'enter:GATE:1g3ti83'
      ]);
    });

  });


  describe('end event', function() {

    verify('end-event', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0x7vlx9',
        'createScope:START:0x7vlx9',
        'signal:START:09t9ax8',
        'exit:START:09t9ax8',
        'createScope:Flow_1:0x7vlx9',
        'createScope:Flow_2:0x7vlx9',
        'destroyScope:START:09t9ax8',
        'enter:Flow_1:0x7vlx9',
        'enter:Flow_2:0x7vlx9',
        'exit:Flow_1:06zq377',
        'createScope:END:0x7vlx9',
        'destroyScope:Flow_1:06zq377',
        'exit:Flow_2:0s15kci',
        'createScope:END:0x7vlx9',
        'destroyScope:Flow_2:0s15kci',
        'enter:END:0x7vlx9',
        'enter:END:0x7vlx9',
        'exit:END:1cywlji',
        'destroyScope:END:1cywlji',
        'exit:END:1iwe8sc',
        'destroyScope:END:1iwe8sc',
        'exit:Process_1:0x7vlx9',
        'destroyScope:Process_1:0x7vlx9'
      ]);
    });

  });


  describe('termination', function() {

    verify('terminate', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0ugqrzi',
        'createScope:START:0ugqrzi',
        'signal:START:1eyj0ny',
        'exit:START:1eyj0ny',
        'createScope:Flow_1:0ugqrzi',
        'createScope:Flow_2:0ugqrzi',
        'destroyScope:START:1eyj0ny',
        'enter:Flow_1:0ugqrzi',
        'enter:Flow_2:0ugqrzi',
        'exit:Flow_1:0mq2py0',
        'createScope:TASK:0ugqrzi',
        'destroyScope:Flow_1:0mq2py0',
        'exit:Flow_2:0lj3huv',
        'createScope:T_END:0ugqrzi',
        'destroyScope:Flow_2:0lj3huv',
        'enter:TASK:0ugqrzi',
        'enter:T_END:0ugqrzi',
        'destroyScope:TASK:0ly9535',
        'exit:T_END:1vp7n97',
        'destroyScope:T_END:1vp7n97',
        'exit:Process_1:0ugqrzi',
        'destroyScope:Process_1:0ugqrzi'
      ]);
    });


    verify('terminate-nested-scopes', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:146ypzc',
        'createScope:START:146ypzc',
        'signal:START:0gocg2s',
        'exit:START:0gocg2s',
        'createScope:Flow_4:146ypzc',
        'createScope:Flow_6:146ypzc',
        'destroyScope:START:0gocg2s',
        'enter:Flow_4:146ypzc',
        'enter:Flow_6:146ypzc',
        'exit:Flow_4:0ccl4ph',
        'createScope:SUB:146ypzc',
        'destroyScope:Flow_4:0ccl4ph',
        'exit:Flow_6:0i3enlo',
        'createScope:END_TERM:146ypzc',
        'destroyScope:Flow_6:0i3enlo',
        'enter:SUB:146ypzc',
        'createScope:START_SUB:0t9o8ta',
        'enter:END_TERM:146ypzc',
        'destroyScope:START_SUB:0387xdn',
        'destroyScope:SUB:0t9o8ta',
        'exit:END_TERM:1f08ktq',
        'destroyScope:END_TERM:1f08ktq',
        'exit:Process_1:146ypzc',
        'destroyScope:Process_1:146ypzc'
      ]);
    });

  });


  describe('error', function() {

    verify('error-no-catch', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1t61d7t',
        'createScope:Start:1t61d7t',
        'signal:Start:1ro9vtt',
        'exit:Start:1ro9vtt',
        'createScope:Flow_1:1t61d7t',
        'destroyScope:Start:1ro9vtt',
        'enter:Flow_1:1t61d7t',
        'exit:Flow_1:0c0dqm2',
        'createScope:S:1t61d7t',
        'destroyScope:Flow_1:0c0dqm2',
        'enter:S:1t61d7t',
        'createScope:S_START:0n8djbc',
        'signal:S_START:1i9gvjf',
        'exit:S_START:1i9gvjf',
        'createScope:Flow_3:0n8djbc',
        'destroyScope:S_START:1i9gvjf',
        'enter:Flow_3:0n8djbc',
        'exit:Flow_3:1b9ypfc',
        'createScope:S_ERROR_END:0n8djbc',
        'destroyScope:Flow_3:1b9ypfc',
        'enter:S_ERROR_END:0n8djbc',
        'exit:S_ERROR_END:0vfz7oy',
        'destroyScope:S_ERROR_END:0vfz7oy',
        'exit:S:0n8djbc',
        'createScope:Flow_2:1t61d7t',
        'destroyScope:S:0n8djbc',
        'enter:Flow_2:1t61d7t',
        'exit:Flow_2:0t6mzpu',
        'createScope:End:1t61d7t',
        'destroyScope:Flow_2:0t6mzpu',
        'enter:End:1t61d7t',
        'exit:End:0rmj0fu',
        'destroyScope:End:0rmj0fu',
        'exit:Process_1:1t61d7t',
        'destroyScope:Process_1:1t61d7t'
      ]);
    });


    verify('error-trigger-event-sub-process', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1j3wxzm',
        'createScope:Start:1j3wxzm',
        'signal:Start:1bdytml',
        'exit:Start:1bdytml',
        'createScope:Flow_1:1j3wxzm',
        'destroyScope:Start:1bdytml',
        'enter:Flow_1:1j3wxzm',
        'exit:Flow_1:0a094j7',
        'createScope:S:1j3wxzm',
        'destroyScope:Flow_1:0a094j7',
        'enter:S:1j3wxzm',
        'createScope:S_START:069bhij',
        'signal:S_START:1auj329',
        'exit:S_START:1auj329',
        'createScope:Flow_3:069bhij',
        'destroyScope:S_START:1auj329',
        'enter:Flow_3:069bhij',
        'exit:Flow_3:05no5cq',
        'createScope:S_END:069bhij',
        'destroyScope:Flow_3:05no5cq',
        'enter:S_END:069bhij',
        'createScope:S_ERROR_SUB:069bhij',
        'signal:S_ERROR_SUB:0aiprgr',
        'destroyScope:S_END:1444tzu',
        'createScope:START_ERROR:0aiprgr',
        'signal:START_ERROR:1mw2ni0',
        'exit:START_ERROR:1mw2ni0',
        'createScope:Flow_7:0aiprgr',
        'destroyScope:START_ERROR:1mw2ni0',
        'enter:Flow_7:0aiprgr',
        'exit:Flow_7:0qjpste',
        'createScope:END_ERROR:0aiprgr',
        'destroyScope:Flow_7:0qjpste',
        'enter:END_ERROR:0aiprgr',
        'exit:END_ERROR:191ztq8',
        'destroyScope:END_ERROR:191ztq8',
        'exit:S_ERROR_SUB:0aiprgr',
        'destroyScope:S_ERROR_SUB:0aiprgr',
        'exit:S:069bhij',
        'destroyScope:S:069bhij',
        'exit:Process_1:1j3wxzm',
        'destroyScope:Process_1:1j3wxzm'
      ]);
    });


    verify('error-trigger-boundary', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1q6g6y1',
        'createScope:Start:1q6g6y1',
        'signal:Start:02c0aka',
        'exit:Start:02c0aka',
        'createScope:Flow_1:1q6g6y1',
        'destroyScope:Start:02c0aka',
        'enter:Flow_1:1q6g6y1',
        'exit:Flow_1:0w2dlby',
        'createScope:S:1q6g6y1',
        'destroyScope:Flow_1:0w2dlby',
        'enter:S:1q6g6y1',
        'createScope:S_START:0n6l24s',
        'signal:S_START:03jul78',
        'exit:S_START:03jul78',
        'createScope:Flow_3:0n6l24s',
        'destroyScope:S_START:03jul78',
        'enter:Flow_3:0n6l24s',
        'exit:Flow_3:0a7x7ae',
        'createScope:S_END:0n6l24s',
        'destroyScope:Flow_3:0a7x7ae',
        'enter:S_END:0n6l24s',
        'createScope:Error_Boundary:1q6g6y1',
        'signal:Error_Boundary:12y7hai',
        'destroyScope:S_END:02w6frx',
        'exit:S:0n6l24s',
        'destroyScope:S:0n6l24s',
        'exit:Error_Boundary:12y7hai',
        'createScope:Flow_1qizkga:1q6g6y1',
        'destroyScope:Error_Boundary:12y7hai',
        'enter:Flow_1qizkga:1q6g6y1',
        'exit:Flow_1qizkga:18b6gth',
        'createScope:Error_End:1q6g6y1',
        'destroyScope:Flow_1qizkga:18b6gth',
        'enter:Error_End:1q6g6y1',
        'exit:Error_End:1gf0d0v',
        'destroyScope:Error_End:1gf0d0v',
        'exit:Process_1:1q6g6y1',
        'destroyScope:Process_1:1q6g6y1'
      ]);
    });


    verify('error-nested-trigger-boundary', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0xglupr',
        'createScope:START:0xglupr',
        'signal:START:02lobu0',
        'exit:START:02lobu0',
        'createScope:Flow_0izjhw2:0xglupr',
        'destroyScope:START:02lobu0',
        'enter:Flow_0izjhw2:0xglupr',
        'exit:Flow_0izjhw2:0n09oks',
        'createScope:CANCEL_EVENT_SUB_INT:0xglupr',
        'destroyScope:Flow_0izjhw2:0n09oks',
        'enter:CANCEL_EVENT_SUB_INT:0xglupr',
        'createScope:SUB_START:1ikwxlt',
        'signal:SUB_START:0iv18et',
        'exit:SUB_START:0iv18et',
        'createScope:Flow_0atqqyc:1ikwxlt',
        'destroyScope:SUB_START:0iv18et',
        'enter:Flow_0atqqyc:1ikwxlt',
        'exit:Flow_0atqqyc:0b4btly',
        'createScope:SUB_END_ESCALATE:1ikwxlt',
        'destroyScope:Flow_0atqqyc:0b4btly',
        'enter:SUB_END_ESCALATE:1ikwxlt',
        'createScope:CS_SUB:1ikwxlt',
        'signal:CS_SUB:0rxvllm',
        'destroyScope:SUB_END_ESCALATE:1kl6nff',
        'createScope:CS_START:0rxvllm',
        'signal:CS_START:0r8y4y3',
        'exit:CS_START:0r8y4y3',
        'createScope:Flow_1jqqcdq:0rxvllm',
        'destroyScope:CS_START:0r8y4y3',
        'enter:Flow_1jqqcdq:0rxvllm',
        'exit:Flow_1jqqcdq:0rp8i01',
        'createScope:CS_TRIGGER_ERROR:0rxvllm',
        'destroyScope:Flow_1jqqcdq:0rp8i01',
        'enter:CS_TRIGGER_ERROR:0rxvllm',
        'createScope:ERROR_BOUNDARY:0xglupr',
        'signal:ERROR_BOUNDARY:1ddxo62',
        'exit:CS_TRIGGER_ERROR:0agtyur',
        'destroyScope:CS_TRIGGER_ERROR:0agtyur',
        'exit:ERROR_BOUNDARY:1ddxo62',
        'createScope:Flow_06o1xs1:0xglupr',
        'destroyScope:ERROR_BOUNDARY:1ddxo62',
        'exit:CS_SUB:0rxvllm',
        'destroyScope:CS_SUB:0rxvllm',
        'enter:Flow_06o1xs1:0xglupr',
        'exit:CANCEL_EVENT_SUB_INT:1ikwxlt',
        'destroyScope:CANCEL_EVENT_SUB_INT:1ikwxlt',
        'exit:Flow_06o1xs1:0k4zjiv',
        'createScope:ERROR_END:0xglupr',
        'destroyScope:Flow_06o1xs1:0k4zjiv',
        'enter:ERROR_END:0xglupr',
        'exit:ERROR_END:0xahw56',
        'destroyScope:ERROR_END:0xahw56',
        'exit:Process_1:0xglupr',
        'destroyScope:Process_1:0xglupr'
      ]);
    });

  });


  describe('signal', function() {

    verify('signal-trigger-start-event', () => {

      // when
      signal({
        element: element('Participant_1')
      });

      // then
      expectTrace([
        'createScope:Participant_1:null',
        'signal:Participant_1:052f35e',
        'createScope:START:052f35e',
        'signal:START:1585frr',
        'exit:START:1585frr',
        'createScope:Flow_1:052f35e',
        'destroyScope:START:1585frr',
        'enter:Flow_1:052f35e',
        'exit:Flow_1:1jxg3wu',
        'createScope:SIGNAL_THROW:052f35e',
        'destroyScope:Flow_1:1jxg3wu',
        'enter:SIGNAL_THROW:052f35e',
        'createScope:Participant_2:null',
        'signal:Participant_2:0qbkt4o',
        'createScope:SIGNAL_START:0qbkt4o',
        'exit:SIGNAL_THROW:0kno9na',
        'createScope:Flow_2:052f35e',
        'destroyScope:SIGNAL_THROW:0kno9na',
        'signal:SIGNAL_START:1h5bgkg',
        'enter:Flow_2:052f35e',
        'exit:SIGNAL_START:1h5bgkg',
        'createScope:Flow_4:0qbkt4o',
        'destroyScope:SIGNAL_START:1h5bgkg',
        'exit:Flow_2:1tl2zr4',
        'createScope:END:052f35e',
        'destroyScope:Flow_2:1tl2zr4',
        'enter:Flow_4:0qbkt4o',
        'enter:END:052f35e',
        'exit:Flow_4:1radaj9',
        'createScope:SIGNAL_END:0qbkt4o',
        'destroyScope:Flow_4:1radaj9',
        'exit:END:03amu8w',
        'destroyScope:END:03amu8w',
        'enter:SIGNAL_END:0qbkt4o',
        'exit:Participant_1:052f35e',
        'destroyScope:Participant_1:052f35e',
        'exit:SIGNAL_END:0npk50a',
        'destroyScope:SIGNAL_END:0npk50a',
        'exit:Participant_2:0qbkt4o',
        'destroyScope:Participant_2:0qbkt4o'
      ]);
    });


    verify('signal-trigger-event-based-gateway', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:04y9jfr',
        'createScope:START:04y9jfr',
        'signal:START:0ozm9hj',
        'exit:START:0ozm9hj',
        'createScope:Flow_1:04y9jfr',
        'destroyScope:START:0ozm9hj',
        'enter:Flow_1:04y9jfr',
        'exit:Flow_1:1dv8gh1',
        'createScope:PARALLEL_GATE:04y9jfr',
        'destroyScope:Flow_1:1dv8gh1',
        'enter:PARALLEL_GATE:04y9jfr',
        'exit:PARALLEL_GATE:0bo11ka',
        'createScope:Flow_2:04y9jfr',
        'createScope:Flow_5:04y9jfr',
        'destroyScope:PARALLEL_GATE:0bo11ka',
        'enter:Flow_2:04y9jfr',
        'enter:Flow_5:04y9jfr',
        'exit:Flow_2:0nte08x',
        'createScope:EVENT_BLANK:04y9jfr',
        'destroyScope:Flow_2:0nte08x',
        'exit:Flow_5:1o3a0tw',
        'createScope:EVT_GATE:04y9jfr',
        'destroyScope:Flow_5:1o3a0tw',
        'enter:EVENT_BLANK:04y9jfr',
        'enter:EVT_GATE:04y9jfr',
        'exit:EVENT_BLANK:0jpecur',
        'createScope:Flow_3:04y9jfr',
        'destroyScope:EVENT_BLANK:0jpecur',
        'enter:Flow_3:04y9jfr',
        'exit:Flow_3:0apygnx',
        'createScope:THROW_A:04y9jfr',
        'destroyScope:Flow_3:0apygnx',
        'enter:THROW_A:04y9jfr',
        'signal:CATCH_A:0nji4i7',
        'exit:THROW_A:00lkx8w',
        'createScope:Flow_4:04y9jfr',
        'destroyScope:THROW_A:00lkx8w',
        'exit:CATCH_A:0nji4i7',
        'createScope:Flow_7:04y9jfr',
        'destroyScope:EVT_GATE:0nji4i7',
        'enter:Flow_4:04y9jfr',
        'enter:Flow_7:04y9jfr',
        'exit:Flow_4:1lsujhr',
        'createScope:END_A:04y9jfr',
        'destroyScope:Flow_4:1lsujhr',
        'exit:Flow_7:1i41xa6',
        'createScope:END_B:04y9jfr',
        'destroyScope:Flow_7:1i41xa6',
        'enter:END_A:04y9jfr',
        'enter:END_B:04y9jfr',
        'exit:END_A:10j491k',
        'destroyScope:END_A:10j491k',
        'exit:END_B:1vh0c4f',
        'destroyScope:END_B:1vh0c4f',
        'exit:Process_1:04y9jfr',
        'destroyScope:Process_1:04y9jfr'
      ]);
    });


    verify('signal-trigger-event-sub-process', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0bxs21s',
        'createScope:START:0bxs21s',
        'signal:START:072ycyc',
        'exit:START:072ycyc',
        'createScope:Flow_04u2uoq:0bxs21s',
        'destroyScope:START:072ycyc',
        'enter:Flow_04u2uoq:0bxs21s',
        'exit:Flow_04u2uoq:01pqau2',
        'createScope:SIGNAL_A:0bxs21s',
        'destroyScope:Flow_04u2uoq:01pqau2',
        'enter:SIGNAL_A:0bxs21s',
        'createScope:EVT_SUB:0bxs21s',
        'signal:EVT_SUB:0ywqiom',
        'createScope:START_A:0ywqiom',
        'exit:SIGNAL_A:18j8v0i',
        'createScope:Flow_4:0bxs21s',
        'destroyScope:SIGNAL_A:18j8v0i',
        'signal:START_A:0zhiyp5',
        'enter:Flow_4:0bxs21s',
        'exit:START_A:0zhiyp5',
        'createScope:Flow_5:0ywqiom',
        'destroyScope:START_A:0zhiyp5',
        'exit:Flow_4:1qwgc8h',
        'createScope:END_A:0bxs21s',
        'destroyScope:Flow_4:1qwgc8h',
        'enter:Flow_5:0ywqiom',
        'enter:END_A:0bxs21s',
        'exit:Flow_5:0r105ua',
        'createScope:END_SUB:0ywqiom',
        'destroyScope:Flow_5:0r105ua',
        'exit:END_A:093l273',
        'destroyScope:END_A:093l273',
        'enter:END_SUB:0ywqiom',
        'exit:END_SUB:03ner6n',
        'destroyScope:END_SUB:03ner6n',
        'exit:EVT_SUB:0ywqiom',
        'destroyScope:EVT_SUB:0ywqiom',
        'exit:Process_1:0bxs21s',
        'destroyScope:Process_1:0bxs21s'
      ]);
    });


    verify('signal-trigger-intermediate-catch-event', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1qiidhp',
        'createScope:START:1qiidhp',
        'signal:START:1rvrd44',
        'exit:START:1rvrd44',
        'createScope:Flow_1:1qiidhp',
        'destroyScope:START:1rvrd44',
        'enter:Flow_1:1qiidhp',
        'exit:Flow_1:1hhmqb3',
        'createScope:PARALLEL_GATE:1qiidhp',
        'destroyScope:Flow_1:1hhmqb3',
        'enter:PARALLEL_GATE:1qiidhp',
        'exit:PARALLEL_GATE:0rl19ja',
        'createScope:Flow_2:1qiidhp',
        'createScope:Flow_6:1qiidhp',
        'destroyScope:PARALLEL_GATE:0rl19ja',
        'enter:Flow_2:1qiidhp',
        'enter:Flow_6:1qiidhp',
        'exit:Flow_2:1ne0b31',
        'createScope:EVENT_BLANK:1qiidhp',
        'destroyScope:Flow_2:1ne0b31',
        'exit:Flow_6:1i3ep1y',
        'createScope:SIGNAL_A_CATCH:1qiidhp',
        'destroyScope:Flow_6:1i3ep1y',
        'enter:EVENT_BLANK:1qiidhp',
        'enter:SIGNAL_A_CATCH:1qiidhp',
        'exit:EVENT_BLANK:1az70mg',
        'createScope:Flow_3:1qiidhp',
        'destroyScope:EVENT_BLANK:1az70mg',
        'enter:Flow_3:1qiidhp',
        'exit:Flow_3:0mbc2um',
        'createScope:SIGNAL_A_THROW:1qiidhp',
        'destroyScope:Flow_3:0mbc2um',
        'enter:SIGNAL_A_THROW:1qiidhp',
        'signal:SIGNAL_A_CATCH:07df8vz',
        'exit:SIGNAL_A_THROW:18gapal',
        'createScope:Flow_4:1qiidhp',
        'destroyScope:SIGNAL_A_THROW:18gapal',
        'exit:SIGNAL_A_CATCH:07df8vz',
        'createScope:Flow_7:1qiidhp',
        'destroyScope:SIGNAL_A_CATCH:07df8vz',
        'enter:Flow_4:1qiidhp',
        'enter:Flow_7:1qiidhp',
        'exit:Flow_4:02r0mh3',
        'createScope:END_A:1qiidhp',
        'destroyScope:Flow_4:02r0mh3',
        'exit:Flow_7:0xg7re2',
        'createScope:END_B:1qiidhp',
        'destroyScope:Flow_7:0xg7re2',
        'enter:END_A:1qiidhp',
        'enter:END_B:1qiidhp',
        'exit:END_A:0hw55ot',
        'destroyScope:END_A:0hw55ot',
        'exit:END_B:05yrvfd',
        'destroyScope:END_B:05yrvfd',
        'exit:Process_1:1qiidhp',
        'destroyScope:Process_1:1qiidhp'
      ]);
    });


    verify('signal-trigger-boundary-event', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0zdq8b9',
        'createScope:START:0zdq8b9',
        'signal:START:18q0gel',
        'exit:START:18q0gel',
        'createScope:Flow_176dg60:0zdq8b9',
        'destroyScope:START:18q0gel',
        'enter:Flow_176dg60:0zdq8b9',
        'exit:Flow_176dg60:0zuvplr',
        'createScope:SUB:0zdq8b9',
        'destroyScope:Flow_176dg60:0zuvplr',
        'enter:SUB:0zdq8b9',
        'createScope:START_SUB:08fwlop',
        'signal:START_SUB:0j8fz4o',
        'exit:START_SUB:0j8fz4o',
        'createScope:Flow_104tc9y:08fwlop',
        'destroyScope:START_SUB:0j8fz4o',
        'enter:Flow_104tc9y:08fwlop',
        'exit:Flow_104tc9y:1a1xhd0',
        'createScope:SIGNAL_A:08fwlop',
        'destroyScope:Flow_104tc9y:1a1xhd0',
        'enter:SIGNAL_A:08fwlop',
        'createScope:BOUNDARY_A:0zdq8b9',
        'signal:BOUNDARY_A:10r5bza',
        'destroyScope:SIGNAL_A:1n61drc',
        'exit:SUB:08fwlop',
        'destroyScope:SUB:08fwlop',
        'exit:BOUNDARY_A:10r5bza',
        'createScope:Flow_0pzj65w:0zdq8b9',
        'destroyScope:BOUNDARY_A:10r5bza',
        'enter:Flow_0pzj65w:0zdq8b9',
        'exit:Flow_0pzj65w:0m6hxuh',
        'createScope:END_A:0zdq8b9',
        'destroyScope:Flow_0pzj65w:0m6hxuh',
        'enter:END_A:0zdq8b9',
        'exit:END_A:1d47fsq',
        'destroyScope:END_A:1d47fsq',
        'exit:Process_1:0zdq8b9',
        'destroyScope:Process_1:0zdq8b9'
      ]);
    });


    verify('signal-madness', () => {

      // when
      signal({
        element: element('Process_1'),
        startEvent: element('START')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0zvl0mh',
        'createScope:START:0zvl0mh',
        'signal:START:1tnwwqq',
        'exit:START:1tnwwqq',
        'createScope:Flow_108sk9x:0zvl0mh',
        'createScope:Flow_0z3vi5e:0zvl0mh',
        'destroyScope:START:1tnwwqq',
        'enter:Flow_108sk9x:0zvl0mh',
        'enter:Flow_0z3vi5e:0zvl0mh',
        'exit:Flow_108sk9x:17k4xnk',
        'createScope:Event_1weiqmc:0zvl0mh',
        'destroyScope:Flow_108sk9x:17k4xnk',
        'exit:Flow_0z3vi5e:1d2vfd4',
        'createScope:REC_1:0zvl0mh',
        'destroyScope:Flow_0z3vi5e:1d2vfd4',
        'enter:Event_1weiqmc:0zvl0mh',
        'enter:REC_1:0zvl0mh',
        'exit:Event_1weiqmc:1syavof',
        'createScope:Flow_0kw1f6j:0zvl0mh',
        'destroyScope:Event_1weiqmc:1syavof',
        'enter:Flow_0kw1f6j:0zvl0mh',
        'exit:Flow_0kw1f6j:1d933v4',
        'createScope:SEND_1:0zvl0mh',
        'destroyScope:Flow_0kw1f6j:1d933v4',
        'enter:SEND_1:0zvl0mh',
        'createScope:Activity_1yp7ae1:0zvl0mh',
        'signal:REC_1:1fcka4a',
        'signal:Activity_1yp7ae1:0jh5you',
        'createScope:START_S:0jh5you',
        'exit:SEND_1:1oll48u',
        'createScope:Flow_0346ss6:0zvl0mh',
        'destroyScope:SEND_1:1oll48u',
        'exit:REC_1:1fcka4a',
        'createScope:Flow_1fq8297:0zvl0mh',
        'destroyScope:REC_1:1fcka4a',
        'signal:START_S:0jntvx3',
        'enter:Flow_0346ss6:0zvl0mh',
        'enter:Flow_1fq8297:0zvl0mh',
        'exit:START_S:0jntvx3',
        'createScope:Flow_1i1q00n:0jh5you',
        'destroyScope:START_S:0jntvx3',
        'exit:Flow_0346ss6:07usdvk',
        'createScope:REC_2:0zvl0mh',
        'destroyScope:Flow_0346ss6:07usdvk',
        'exit:Flow_1fq8297:1plo0w5',
        'createScope:REC_3:0zvl0mh',
        'destroyScope:Flow_1fq8297:1plo0w5',
        'enter:Flow_1i1q00n:0jh5you',
        'enter:REC_2:0zvl0mh',
        'enter:REC_3:0zvl0mh',
        'exit:Flow_1i1q00n:11xwjps',
        'createScope:END_S:0jh5you',
        'destroyScope:Flow_1i1q00n:11xwjps',
        'enter:END_S:0jh5you',
        'signal:REC_2:1crb28m',
        'exit:END_S:1wmmxes',
        'destroyScope:END_S:1wmmxes',
        'exit:REC_2:1crb28m',
        'createScope:Flow_0z5rf4i:0zvl0mh',
        'destroyScope:REC_2:1crb28m',
        'exit:Activity_1yp7ae1:0jh5you',
        'destroyScope:Activity_1yp7ae1:0jh5you',
        'enter:Flow_0z5rf4i:0zvl0mh',
        'exit:Flow_0z5rf4i:1wnzfpg',
        'createScope:SEND_3:0zvl0mh',
        'destroyScope:Flow_0z5rf4i:1wnzfpg',
        'enter:SEND_3:0zvl0mh',
        'signal:REC_3:1ger2ub',
        'exit:SEND_3:1gyg5c5',
        'createScope:Flow_0skcc47:0zvl0mh',
        'destroyScope:SEND_3:1gyg5c5',
        'exit:REC_3:1ger2ub',
        'createScope:Flow_0qpwtj4:0zvl0mh',
        'destroyScope:REC_3:1ger2ub',
        'enter:Flow_0skcc47:0zvl0mh',
        'enter:Flow_0qpwtj4:0zvl0mh',
        'exit:Flow_0skcc47:1chw084',
        'createScope:A:0zvl0mh',
        'destroyScope:Flow_0skcc47:1chw084',
        'exit:Flow_0qpwtj4:0mkacwy',
        'createScope:B:0zvl0mh',
        'destroyScope:Flow_0qpwtj4:0mkacwy',
        'enter:A:0zvl0mh',
        'enter:B:0zvl0mh',
        'exit:B:1424df8',
        'createScope:Flow_178z1zz:0zvl0mh',
        'destroyScope:B:1424df8',
        'enter:Flow_178z1zz:0zvl0mh',
        'exit:Flow_178z1zz:0cl4rpw',
        'createScope:SEND_4:0zvl0mh',
        'destroyScope:Flow_178z1zz:0cl4rpw',
        'enter:SEND_4:0zvl0mh',
        'createScope:BOUNDARY_4:0zvl0mh',
        'signal:BOUNDARY_4:1127nwq',
        'exit:SEND_4:124i8dj',
        'createScope:Flow_09r2nuh:0zvl0mh',
        'destroyScope:SEND_4:124i8dj',
        'exit:A:0ublsai',
        'destroyScope:A:0ublsai',
        'exit:BOUNDARY_4:1127nwq',
        'createScope:Flow_04j6212:0zvl0mh',
        'destroyScope:BOUNDARY_4:1127nwq',
        'enter:Flow_09r2nuh:0zvl0mh',
        'enter:Flow_04j6212:0zvl0mh',
        'exit:Flow_09r2nuh:0nhnh6k',
        'createScope:GATE_JOIN:0zvl0mh',
        'destroyScope:Flow_09r2nuh:0nhnh6k',
        'exit:Flow_04j6212:0xuqz1y',
        'createScope:GATE_JOIN:0zvl0mh',
        'destroyScope:Flow_04j6212:0xuqz1y',
        'enter:GATE_JOIN:0zvl0mh',
        'destroyScope:GATE_JOIN:0j6rdqf',
        'exit:GATE_JOIN:0caz35p',
        'createScope:Flow_1mtc41r:0zvl0mh',
        'destroyScope:GATE_JOIN:0caz35p',
        'enter:Flow_1mtc41r:0zvl0mh',
        'exit:Flow_1mtc41r:1v33pt8',
        'createScope:END_B:0zvl0mh',
        'destroyScope:Flow_1mtc41r:1v33pt8',
        'enter:END_B:0zvl0mh',
        'exit:END_B:0d5h5ob',
        'destroyScope:END_B:0d5h5ob',
        'exit:Process_1:0zvl0mh',
        'destroyScope:Process_1:0zvl0mh'
      ]);
    });

  });


  describe('escalation', () => {

    verify('escalation-no-catch', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0jlljmq',
        'createScope:START:0jlljmq',
        'signal:START:0bsr9p5',
        'exit:START:0bsr9p5',
        'createScope:Flow_1:0jlljmq',
        'destroyScope:START:0bsr9p5',
        'enter:Flow_1:0jlljmq',
        'exit:Flow_1:0uvm27p',
        'createScope:TRIGGER_E:0jlljmq',
        'destroyScope:Flow_1:0uvm27p',
        'enter:TRIGGER_E:0jlljmq',
        'exit:TRIGGER_E:0pa319e',
        'createScope:Flow_2:0jlljmq',
        'destroyScope:TRIGGER_E:0pa319e',
        'enter:Flow_2:0jlljmq',
        'exit:Flow_2:0ediw3p',
        'createScope:END:0jlljmq',
        'destroyScope:Flow_2:0ediw3p',
        'enter:END:0jlljmq',
        'exit:END:115h25m',
        'destroyScope:END:115h25m',
        'exit:Process_1:0jlljmq',
        'destroyScope:Process_1:0jlljmq'
      ]);
    });


    verify('escalation-trigger-boundary-event', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1gbl8qf',
        'createScope:START:1gbl8qf',
        'signal:START:12iy1hq',
        'exit:START:12iy1hq',
        'createScope:Flow_130qbbc:1gbl8qf',
        'destroyScope:START:12iy1hq',
        'enter:Flow_130qbbc:1gbl8qf',
        'exit:Flow_130qbbc:0qcq8ik',
        'createScope:SUB:1gbl8qf',
        'destroyScope:Flow_130qbbc:0qcq8ik',
        'enter:SUB:1gbl8qf',
        'createScope:START_SUB:0fhzoj8',
        'signal:START_SUB:1okw0qv',
        'exit:START_SUB:1okw0qv',
        'createScope:Flow_1ovq66q:0fhzoj8',
        'destroyScope:START_SUB:1okw0qv',
        'enter:Flow_1ovq66q:0fhzoj8',
        'exit:Flow_1ovq66q:0k4tdpg',
        'createScope:TRIGGER_E:0fhzoj8',
        'destroyScope:Flow_1ovq66q:0k4tdpg',
        'enter:TRIGGER_E:0fhzoj8',
        'createScope:BOUNDARY_E:1gbl8qf',
        'signal:BOUNDARY_E:15n4khf',
        'destroyScope:TRIGGER_E:0u0jxko',
        'exit:SUB:0fhzoj8',
        'destroyScope:SUB:0fhzoj8',
        'exit:BOUNDARY_E:15n4khf',
        'createScope:Flow_0otmxuz:1gbl8qf',
        'destroyScope:BOUNDARY_E:15n4khf',
        'enter:Flow_0otmxuz:1gbl8qf',
        'exit:Flow_0otmxuz:0mrfe69',
        'createScope:END_E:1gbl8qf',
        'destroyScope:Flow_0otmxuz:0mrfe69',
        'enter:END_E:1gbl8qf',
        'exit:END_E:0wibzju',
        'destroyScope:END_E:0wibzju',
        'exit:Process_1:1gbl8qf',
        'destroyScope:Process_1:1gbl8qf'
      ]);
    });


    verify('escalation-trigger-event-sub-process', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:12iccus',
        'createScope:START:12iccus',
        'signal:START:0ge2zdm',
        'exit:START:0ge2zdm',
        'createScope:Flow_130qbbc:12iccus',
        'destroyScope:START:0ge2zdm',
        'enter:Flow_130qbbc:12iccus',
        'exit:Flow_130qbbc:09khq3d',
        'createScope:SUB:12iccus',
        'destroyScope:Flow_130qbbc:09khq3d',
        'enter:SUB:12iccus',
        'createScope:START_SUB:0d6qcju',
        'signal:START_SUB:1lylq7k',
        'exit:START_SUB:1lylq7k',
        'createScope:Flow_1ovq66q:0d6qcju',
        'destroyScope:START_SUB:1lylq7k',
        'enter:Flow_1ovq66q:0d6qcju',
        'exit:Flow_1ovq66q:1we13uf',
        'createScope:TRIGGER_E:0d6qcju',
        'destroyScope:Flow_1ovq66q:1we13uf',
        'enter:TRIGGER_E:0d6qcju',
        'createScope:EVT_E:12iccus',
        'signal:EVT_E:0jn6dq0',
        'destroyScope:TRIGGER_E:115c5ou',
        'destroyScope:SUB:0d6qcju',
        'createScope:START_EVT_E:0jn6dq0',
        'signal:START_EVT_E:1e1oyy6',
        'exit:START_EVT_E:1e1oyy6',
        'createScope:Flow_19vkjao:0jn6dq0',
        'destroyScope:START_EVT_E:1e1oyy6',
        'enter:Flow_19vkjao:0jn6dq0',
        'exit:Flow_19vkjao:1mcuwrt',
        'createScope:END_EVT_E:0jn6dq0',
        'destroyScope:Flow_19vkjao:1mcuwrt',
        'enter:END_EVT_E:0jn6dq0',
        'exit:END_EVT_E:1wv943c',
        'destroyScope:END_EVT_E:1wv943c',
        'exit:EVT_E:0jn6dq0',
        'destroyScope:EVT_E:0jn6dq0',
        'exit:Process_1:12iccus',
        'destroyScope:Process_1:12iccus'
      ]);
    });


    verify('escalation-boundary-event-event-sub-process-conflict', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0ppx11q',
        'createScope:START:0ppx11q',
        'signal:START:1myy9u2',
        'exit:START:1myy9u2',
        'createScope:Flow_130qbbc:0ppx11q',
        'destroyScope:START:1myy9u2',
        'enter:Flow_130qbbc:0ppx11q',
        'exit:Flow_130qbbc:0mtx4h1',
        'createScope:SUB:0ppx11q',
        'destroyScope:Flow_130qbbc:0mtx4h1',
        'enter:SUB:0ppx11q',
        'createScope:START_SUB:1jnd7dw',
        'signal:START_SUB:0xsfomj',
        'exit:START_SUB:0xsfomj',
        'createScope:Flow_1ovq66q:1jnd7dw',
        'destroyScope:START_SUB:0xsfomj',
        'enter:Flow_1ovq66q:1jnd7dw',
        'exit:Flow_1ovq66q:0j5jrm8',
        'createScope:TRIGGER_E:1jnd7dw',
        'destroyScope:Flow_1ovq66q:0j5jrm8',
        'enter:TRIGGER_E:1jnd7dw',
        'createScope:EVT_E:1jnd7dw',
        'signal:EVT_E:160c1t0',
        'destroyScope:TRIGGER_E:0wddf7n',
        'createScope:START_EVT_E:160c1t0',
        'signal:START_EVT_E:16m2f3f',
        'exit:START_EVT_E:16m2f3f',
        'createScope:Flow_19vkjao:160c1t0',
        'destroyScope:START_EVT_E:16m2f3f',
        'enter:Flow_19vkjao:160c1t0',
        'exit:Flow_19vkjao:0otlxhr',
        'createScope:END_EVT_E:160c1t0',
        'destroyScope:Flow_19vkjao:0otlxhr',
        'enter:END_EVT_E:160c1t0',
        'exit:END_EVT_E:1i44uv3',
        'destroyScope:END_EVT_E:1i44uv3',
        'exit:EVT_E:160c1t0',
        'destroyScope:EVT_E:160c1t0',
        'exit:SUB:1jnd7dw',
        'destroyScope:SUB:1jnd7dw',
        'exit:Process_1:0ppx11q',
        'destroyScope:Process_1:0ppx11q'
      ]);
    });

  });


  describe('sub-process', function() {

    verify('sub-process', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0hvyhts',
        'createScope:START:0hvyhts',
        'signal:START:1k80fd1',
        'exit:START:1k80fd1',
        'createScope:Flow_2:0hvyhts',
        'destroyScope:START:1k80fd1',
        'enter:Flow_2:0hvyhts',
        'exit:Flow_2:1xt9ux4',
        'createScope:SUB:0hvyhts',
        'destroyScope:Flow_2:1xt9ux4',
        'enter:SUB:0hvyhts',
        'createScope:START_SUB:0volx4b',
        'signal:START_SUB:1mcxzu5',
        'exit:START_SUB:1mcxzu5',
        'createScope:Flow_4:0volx4b',
        'destroyScope:START_SUB:1mcxzu5',
        'enter:Flow_4:0volx4b',
        'exit:Flow_4:1fcdi6e',
        'createScope:TASK_SUB:0volx4b',
        'destroyScope:Flow_4:1fcdi6e',
        'enter:TASK_SUB:0volx4b',
        'exit:TASK_SUB:02p1o6a',
        'createScope:Flow_1:0volx4b',
        'destroyScope:TASK_SUB:02p1o6a',
        'enter:Flow_1:0volx4b',
        'exit:Flow_1:19bhhxr',
        'createScope:END_SUB:0volx4b',
        'destroyScope:Flow_1:19bhhxr',
        'enter:END_SUB:0volx4b',
        'exit:END_SUB:03d2yc3',
        'destroyScope:END_SUB:03d2yc3',
        'exit:SUB:0volx4b',
        'createScope:Flow_3:0hvyhts',
        'destroyScope:SUB:0volx4b',
        'enter:Flow_3:0hvyhts',
        'exit:Flow_3:0mz1k64',
        'createScope:END:0hvyhts',
        'destroyScope:Flow_3:0mz1k64',
        'enter:END:0hvyhts',
        'exit:END:182oiye',
        'destroyScope:END:182oiye',
        'exit:Process_1:0hvyhts',
        'destroyScope:Process_1:0hvyhts'
      ]);
    });

  });


  describe('event sub-process', function() {

    verify('event-sub-process-interrupting', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0b07rqh',
        'createScope:START:0b07rqh',
        'signal:START:0ylosd2',
        'exit:START:0ylosd2',
        'createScope:Flow_5:0b07rqh',
        'destroyScope:START:0ylosd2',
        'enter:Flow_5:0b07rqh',
        'exit:Flow_5:0o283pq',
        'createScope:S:0b07rqh',
        'destroyScope:Flow_5:0o283pq',
        'enter:S:0b07rqh',
        'createScope:START_S:0cw7taw',
        'signal:START_S:15gwzdr',
        'exit:START_S:15gwzdr',
        'createScope:Flow_6:0cw7taw',
        'destroyScope:START_S:15gwzdr',
        'enter:Flow_6:0cw7taw',
        'exit:Flow_6:1i4u0vr',
        'createScope:RECEIVE:0cw7taw',
        'destroyScope:Flow_6:1i4u0vr',
        'enter:RECEIVE:0cw7taw',
        'createScope:EVENT_SUB:0b07rqh',
        'signal:EVENT_SUB:0oz2s6t',
        'destroyScope:RECEIVE:011welq',
        'destroyScope:S:0cw7taw',
        'createScope:START_SUB:0oz2s6t',
        'signal:START_SUB:1hm5e9j',
        'exit:START_SUB:1hm5e9j',
        'createScope:Flow_3:0oz2s6t',
        'destroyScope:START_SUB:1hm5e9j',
        'enter:Flow_3:0oz2s6t',
        'exit:Flow_3:1om0ou5',
        'createScope:END_SUB:0oz2s6t',
        'destroyScope:Flow_3:1om0ou5',
        'enter:END_SUB:0oz2s6t',
        'exit:END_SUB:14rge6w',
        'destroyScope:END_SUB:14rge6w',
        'exit:EVENT_SUB:0oz2s6t',
        'destroyScope:EVENT_SUB:0oz2s6t',
        'exit:Process_1:0b07rqh',
        'destroyScope:Process_1:0b07rqh'
      ]);

    });


    verify('event-sub-process-non-interrupting', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:150p3bn',
        'createScope:START:150p3bn',
        'signal:START:10b61uu',
        'exit:START:10b61uu',
        'createScope:Flow_1:150p3bn',
        'destroyScope:START:10b61uu',
        'enter:Flow_1:150p3bn',
        'exit:Flow_1:0qk04ef',
        'createScope:RECEIVE:150p3bn',
        'destroyScope:Flow_1:0qk04ef',
        'enter:RECEIVE:150p3bn',
        'createScope:EVENT_SUB:150p3bn',
        'signal:EVENT_SUB:081v4vo',
        'createScope:START_SUB:081v4vo',
        'signal:START_SUB:0gvao8e',
        'exit:START_SUB:0gvao8e',
        'createScope:Flow_3:081v4vo',
        'destroyScope:START_SUB:0gvao8e',
        'enter:Flow_3:081v4vo',
        'exit:Flow_3:0zzkq7u',
        'createScope:END_SUB:081v4vo',
        'destroyScope:Flow_3:0zzkq7u',
        'enter:END_SUB:081v4vo',
        'exit:END_SUB:0sr0aqp',
        'destroyScope:END_SUB:0sr0aqp',
        'exit:EVENT_SUB:081v4vo',
        'destroyScope:EVENT_SUB:081v4vo'
      ]);

    });


    verify('event-sub-process-cancelation', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:05a4z4z',
        'createScope:START:05a4z4z',
        'signal:START:0n9kblb',
        'exit:START:0n9kblb',
        'createScope:Flow_1:05a4z4z',
        'destroyScope:START:0n9kblb',
        'enter:Flow_1:05a4z4z',
        'exit:Flow_1:17o6mvm',
        'createScope:END:05a4z4z',
        'destroyScope:Flow_1:17o6mvm',
        'enter:END:05a4z4z',
        'createScope:SUB_N_INT:05a4z4z',
        'createScope:SUB_INT:05a4z4z',
        'createScope:SUB_N_INT_2:05a4z4z',
        'signal:SUB_N_INT:1dsnwus',
        'createScope:START_N_INT:1dsnwus',
        'signal:SUB_INT:16b2anj',
        'destroyScope:END:1otulae',
        'destroyScope:START_N_INT:19uqan7',
        'destroyScope:SUB_N_INT:1dsnwus',
        'destroyScope:SUB_N_INT_2:018ofx6',
        'createScope:START_INT:16b2anj',
        'signal:START_INT:0ln9qf1',
        'exit:START_INT:0ln9qf1',
        'createScope:Flow_3:16b2anj',
        'destroyScope:START_INT:0ln9qf1',
        'enter:Flow_3:16b2anj',
        'exit:Flow_3:05ht2yc',
        'createScope:END_INT:16b2anj',
        'destroyScope:Flow_3:05ht2yc',
        'enter:END_INT:16b2anj',
        'exit:END_INT:037ic40',
        'destroyScope:END_INT:037ic40',
        'exit:SUB_INT:16b2anj',
        'destroyScope:SUB_INT:16b2anj',
        'exit:Process_1:05a4z4z',
        'destroyScope:Process_1:05a4z4z'
      ]);
    });


    verify('event-sub-process-nested-cancelation', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:16vmct2',
        'createScope:START:16vmct2',
        'signal:START:128y842',
        'exit:START:128y842',
        'createScope:Flow_5:16vmct2',
        'destroyScope:START:128y842',
        'enter:Flow_5:16vmct2',
        'exit:Flow_5:1wi6xrm',
        'createScope:SUB:16vmct2',
        'destroyScope:Flow_5:1wi6xrm',
        'enter:SUB:16vmct2',
        'createScope:START_SUB:1s6btt6',
        'signal:START_SUB:0xe7i60',
        'exit:START_SUB:0xe7i60',
        'createScope:Flow_1:1s6btt6',
        'destroyScope:START_SUB:0xe7i60',
        'enter:Flow_1:1s6btt6',
        'exit:Flow_1:102zdh6',
        'createScope:THROW_SUB:1s6btt6',
        'destroyScope:Flow_1:102zdh6',
        'enter:THROW_SUB:1s6btt6',
        'createScope:SUB_N_INT:1s6btt6',
        'createScope:SUB_INT:1s6btt6',
        'signal:SUB_N_INT:0qd73y9',
        'createScope:START_N_INT:0qd73y9',
        'signal:SUB_INT:1dmaeid',
        'destroyScope:THROW_SUB:18ga5q5',
        'destroyScope:START_N_INT:1a3xomq',
        'destroyScope:SUB_N_INT:0qd73y9',
        'createScope:START_INT:1dmaeid',
        'signal:START_INT:11vqdlr',
        'exit:START_INT:11vqdlr',
        'createScope:Flow_3:1dmaeid',
        'destroyScope:START_INT:11vqdlr',
        'enter:Flow_3:1dmaeid',
        'exit:Flow_3:10u8g6r',
        'createScope:END_INT:1dmaeid',
        'destroyScope:Flow_3:10u8g6r',
        'enter:END_INT:1dmaeid',
        'exit:END_INT:06ez24v',
        'destroyScope:END_INT:06ez24v',
        'exit:SUB_INT:1dmaeid',
        'destroyScope:SUB_INT:1dmaeid',
        'exit:SUB:1s6btt6',
        'destroyScope:SUB:1s6btt6',
        'exit:Process_1:16vmct2',
        'destroyScope:Process_1:16vmct2'
      ]);
    });


    verify('event-sub-process-nested-cancelation-boundary-event', () => {

      // when
      signal({
        element: element('Process_1')
      });

      // then
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1a92ppu',
        'createScope:START:1a92ppu',
        'signal:START:0ywyqnb',
        'exit:START:0ywyqnb',
        'createScope:Flow_5:1a92ppu',
        'destroyScope:START:0ywyqnb',
        'enter:Flow_5:1a92ppu',
        'exit:Flow_5:1v7rhce',
        'createScope:SUB:1a92ppu',
        'destroyScope:Flow_5:1v7rhce',
        'enter:SUB:1a92ppu',
        'createScope:START_SUB:1roq4l1',
        'signal:START_SUB:1rd6er6',
        'exit:START_SUB:1rd6er6',
        'createScope:Flow_1:1roq4l1',
        'destroyScope:START_SUB:1rd6er6',
        'enter:Flow_1:1roq4l1',
        'exit:Flow_1:10wyo2t',
        'createScope:SIGNAL_SUB:1roq4l1',
        'destroyScope:Flow_1:10wyo2t',
        'enter:SIGNAL_SUB:1roq4l1',
        'createScope:SUB_INT:1roq4l1',
        'signal:SUB_INT:07t0gy9',
        'destroyScope:SIGNAL_SUB:0qi58g6',
        'createScope:START_INT:07t0gy9',
        'signal:START_INT:1lfei36',
        'exit:START_INT:1lfei36',
        'createScope:Flow_3:07t0gy9',
        'destroyScope:START_INT:1lfei36',
        'enter:Flow_3:07t0gy9',
        'exit:Flow_3:0mg3di9',
        'createScope:END_INT:07t0gy9',
        'destroyScope:Flow_3:0mg3di9',
        'enter:END_INT:07t0gy9',
        'createScope:BOUNDARY_S:1a92ppu',
        'signal:BOUNDARY_S:0i6bz69',
        'exit:END_INT:001ypuv',
        'destroyScope:END_INT:001ypuv',
        'exit:BOUNDARY_S:0i6bz69',
        'createScope:Flow_10:1a92ppu',
        'destroyScope:BOUNDARY_S:0i6bz69',
        'exit:SUB_INT:07t0gy9',
        'destroyScope:SUB_INT:07t0gy9',
        'enter:Flow_10:1a92ppu',
        'exit:SUB:1roq4l1',
        'destroyScope:SUB:1roq4l1',
        'exit:Flow_10:0nu7l8z',
        'createScope:END_S:1a92ppu',
        'destroyScope:Flow_10:0nu7l8z',
        'enter:END_S:1a92ppu',
        'exit:END_S:0vu2jen',
        'destroyScope:END_S:0vu2jen',
        'exit:Process_1:1a92ppu',
        'destroyScope:Process_1:1a92ppu'
      ]);
    });

  });


  describe('boundary events', function() {

    verify('boundary-interrupting-sub-process', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0xqzwoz',
        'createScope:START:0xqzwoz',
        'signal:START:1jwuzeq',
        'exit:START:1jwuzeq',
        'createScope:Flow_4:0xqzwoz',
        'destroyScope:START:1jwuzeq',
        'enter:Flow_4:0xqzwoz',
        'exit:Flow_4:1tztt90',
        'createScope:SUB:0xqzwoz',
        'destroyScope:Flow_4:1tztt90',
        'enter:SUB:0xqzwoz',
        'createScope:START_SUB:1h9xzcr',
        'signal:START_SUB:0g4v30m',
        'exit:START_SUB:0g4v30m',
        'createScope:Flow_3:1h9xzcr',
        'destroyScope:START_SUB:0g4v30m',
        'enter:Flow_3:1h9xzcr',
        'exit:Flow_3:1v6ta2p',
        'createScope:CATCH_SUB:1h9xzcr',
        'destroyScope:Flow_3:1v6ta2p',
        'enter:CATCH_SUB:1h9xzcr',
        'createScope:B_RUPTING:0xqzwoz',
        'signal:B_RUPTING:1557188',
        'destroyScope:CATCH_SUB:05itneo',
        'exit:SUB:1h9xzcr',
        'destroyScope:SUB:1h9xzcr',
        'exit:B_RUPTING:1557188',
        'createScope:Flow_6:0xqzwoz',
        'destroyScope:B_RUPTING:1557188',
        'enter:Flow_6:0xqzwoz',
        'exit:Flow_6:1r4fvxk',
        'createScope:END_B:0xqzwoz',
        'destroyScope:Flow_6:1r4fvxk',
        'enter:END_B:0xqzwoz',
        'exit:END_B:01hf7h2',
        'destroyScope:END_B:01hf7h2',
        'exit:Process_1:0xqzwoz',
        'destroyScope:Process_1:0xqzwoz'
      ]);
    });


    verify('boundary-non-interrupting-sub-process', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:1spzl29',
        'createScope:START:1spzl29',
        'signal:START:0a39zp6',
        'exit:START:0a39zp6',
        'createScope:Flow_4:1spzl29',
        'destroyScope:START:0a39zp6',
        'enter:Flow_4:1spzl29',
        'exit:Flow_4:0m9g5ux',
        'createScope:SUB:1spzl29',
        'destroyScope:Flow_4:0m9g5ux',
        'enter:SUB:1spzl29',
        'createScope:START_SUB:0lnog18',
        'signal:START_SUB:1nrcnk4',
        'exit:START_SUB:1nrcnk4',
        'createScope:Flow_3:0lnog18',
        'destroyScope:START_SUB:1nrcnk4',
        'enter:Flow_3:0lnog18',
        'exit:Flow_3:0l89edx',
        'createScope:CATCH_SUB:0lnog18',
        'destroyScope:Flow_3:0l89edx',
        'enter:CATCH_SUB:0lnog18',
        'createScope:B_NRUPTING:1spzl29',
        'signal:B_NRUPTING:0zb84h5',
        'exit:B_NRUPTING:0zb84h5',
        'createScope:Flow_6:1spzl29',
        'destroyScope:B_NRUPTING:0zb84h5',
        'enter:Flow_6:1spzl29',
        'exit:Flow_6:0e8fxgy',
        'createScope:END_B:1spzl29',
        'destroyScope:Flow_6:0e8fxgy',
        'enter:END_B:1spzl29',
        'exit:END_B:0cws1tg',
        'destroyScope:END_B:0cws1tg'
      ]);
    });


    verify('boundary-interrupting-task', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0a2rwuy',
        'createScope:START:0a2rwuy',
        'signal:START:1xou9su',
        'exit:START:1xou9su',
        'createScope:Flow_1:0a2rwuy',
        'destroyScope:START:1xou9su',
        'enter:Flow_1:0a2rwuy',
        'exit:Flow_1:0i2fz8u',
        'createScope:RECEIVE:0a2rwuy',
        'destroyScope:Flow_1:0i2fz8u',
        'enter:RECEIVE:0a2rwuy',
        'createScope:B_RUPTING:0a2rwuy',
        'signal:B_RUPTING:1ctyb5z',
        'exit:RECEIVE:1v9w1b1',
        'destroyScope:RECEIVE:1v9w1b1',
        'exit:B_RUPTING:1ctyb5z',
        'createScope:Flow_2:0a2rwuy',
        'destroyScope:B_RUPTING:1ctyb5z',
        'enter:Flow_2:0a2rwuy',
        'exit:Flow_2:16qa7pb',
        'createScope:END_B:0a2rwuy',
        'destroyScope:Flow_2:16qa7pb',
        'enter:END_B:0a2rwuy',
        'exit:END_B:0tjmujt',
        'destroyScope:END_B:0tjmujt',
        'exit:Process_1:0a2rwuy',
        'destroyScope:Process_1:0a2rwuy'
      ]);
    });


    verify('boundary-non-interrupting-task', () => {

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
      expectTrace([
        'createScope:Process_1:null',
        'signal:Process_1:0uianl7',
        'createScope:START:0uianl7',
        'signal:START:1bu54qn',
        'exit:START:1bu54qn',
        'createScope:Flow_1:0uianl7',
        'destroyScope:START:1bu54qn',
        'enter:Flow_1:0uianl7',
        'exit:Flow_1:1hzow82',
        'createScope:RECEIVE:0uianl7',
        'destroyScope:Flow_1:1hzow82',
        'enter:RECEIVE:0uianl7',
        'createScope:B_NRUPTING:0uianl7',
        'signal:B_NRUPTING:0fu2ym5',
        'exit:B_NRUPTING:0fu2ym5',
        'createScope:Flow_2:0uianl7',
        'destroyScope:B_NRUPTING:0fu2ym5',
        'enter:Flow_2:0uianl7',
        'exit:Flow_2:02cneh9',
        'createScope:END_B:0uianl7',
        'destroyScope:Flow_2:02cneh9',
        'enter:END_B:0uianl7',
        'exit:END_B:18wmzlx',
        'destroyScope:END_B:18wmzlx'
      ]);
    });

  });


  describe('message flows', function() {

    verify('message-flow-end-event-trigger-flow', () => {

      // when
      signal({
        element: element('PART_EXP')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:PART_EXP:07zsrvi',
        'createScope:START:07zsrvi',
        'signal:START:1fhin7l',
        'exit:START:1fhin7l',
        'createScope:Flow_1:07zsrvi',
        'destroyScope:START:1fhin7l',
        'enter:Flow_1:07zsrvi',
        'exit:Flow_1:0v5crgd',
        'createScope:END:07zsrvi',
        'destroyScope:Flow_1:0v5crgd',
        'enter:END:07zsrvi',
        'createScope:M_FLOW:null',
        'signal:M_FLOW:0ve57yw',
        'exit:END:19ngjeg',
        'destroyScope:END:19ngjeg',
        'exit:M_FLOW:0ve57yw',
        'destroyScope:M_FLOW:0ve57yw',
        'exit:PART_EXP:07zsrvi',
        'destroyScope:PART_EXP:07zsrvi'
      ]);
    });


    verify('message-flow-pool-pool', () => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:M_FLOW:null',
        'signal:M_FLOW:0z7uhdk',
        'exit:M_FLOW:0z7uhdk',
        'destroyScope:M_FLOW:0z7uhdk'
      ]);
    });


    verify('message-flow-task-trigger-flow', () => {

      // when
      signal({
        element: element('PART_EXP')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:PART_EXP:04du1r4',
        'createScope:START:04du1r4',
        'signal:START:1sisnmg',
        'exit:START:1sisnmg',
        'createScope:Flow_1:04du1r4',
        'destroyScope:START:1sisnmg',
        'enter:Flow_1:04du1r4',
        'exit:Flow_1:1e8lk4y',
        'createScope:TASK:04du1r4',
        'destroyScope:Flow_1:1e8lk4y',
        'enter:TASK:04du1r4',
        'createScope:M_FLOW:null',
        'signal:M_FLOW:1kfx0ye',
        'exit:TASK:090szj2',
        'createScope:Flow_2:04du1r4',
        'destroyScope:TASK:090szj2',
        'exit:M_FLOW:1kfx0ye',
        'destroyScope:M_FLOW:1kfx0ye',
        'enter:Flow_2:04du1r4',
        'exit:Flow_2:1xfxds0',
        'createScope:END:04du1r4',
        'destroyScope:Flow_2:1xfxds0',
        'enter:END:04du1r4',
        'exit:END:1ou8tra',
        'destroyScope:END:1ou8tra',
        'exit:PART_EXP:04du1r4',
        'destroyScope:PART_EXP:04du1r4'
      ]);
    });


    verify('message-flow-trigger-receive-task', () => {

      // given
      signal({
        element: element('PART_EXP')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:PART_EXP:1c9w3nr',
        'createScope:START:1c9w3nr',
        'signal:START:04x4d82',
        'exit:START:04x4d82',
        'createScope:Flow_1:1c9w3nr',
        'destroyScope:START:04x4d82',
        'enter:Flow_1:1c9w3nr',
        'exit:Flow_1:1cnbnud',
        'createScope:R_TASK:1c9w3nr',
        'destroyScope:Flow_1:1cnbnud',
        'enter:R_TASK:1c9w3nr',
        'createScope:M_FLOW:null',
        'signal:M_FLOW:096d7lv',
        'exit:M_FLOW:096d7lv',
        'destroyScope:M_FLOW:096d7lv',
        'signal:R_TASK:1qvav3g',
        'exit:R_TASK:1qvav3g',
        'createScope:Flow_2:1c9w3nr',
        'destroyScope:R_TASK:1qvav3g',
        'enter:Flow_2:1c9w3nr',
        'exit:Flow_2:02d5of5',
        'createScope:END:1c9w3nr',
        'destroyScope:Flow_2:02d5of5',
        'enter:END:1c9w3nr',
        'exit:END:18huuhx',
        'destroyScope:END:18huuhx',
        'exit:PART_EXP:1c9w3nr',
        'destroyScope:PART_EXP:1c9w3nr'
      ]);
    });


    verify('message-flow-trigger-event-based-gateway', () => {

      // given
      signal({
        element: element('PART_EXP')
      });

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:PART_EXP:null',
        'signal:PART_EXP:1xu9426',
        'createScope:START:1xu9426',
        'signal:START:1spbgm3',
        'exit:START:1spbgm3',
        'createScope:Flow_1:1xu9426',
        'destroyScope:START:1spbgm3',
        'enter:Flow_1:1xu9426',
        'exit:Flow_1:0g9oaz6',
        'createScope:EVT_GATE:1xu9426',
        'destroyScope:Flow_1:0g9oaz6',
        'enter:EVT_GATE:1xu9426',
        'createScope:M_FLOW:null',
        'signal:M_FLOW:0ur2vxl',
        'exit:M_FLOW:0ur2vxl',
        'destroyScope:M_FLOW:0ur2vxl',
        'signal:R_TASK:14vaqv1',
        'exit:R_TASK:14vaqv1',
        'createScope:Flow_2:1xu9426',
        'destroyScope:EVT_GATE:14vaqv1',
        'enter:Flow_2:1xu9426',
        'exit:Flow_2:05tjay6',
        'createScope:END:1xu9426',
        'destroyScope:Flow_2:05tjay6',
        'enter:END:1xu9426',
        'exit:END:11myv59',
        'destroyScope:END:11myv59',
        'exit:PART_EXP:1xu9426',
        'destroyScope:PART_EXP:1xu9426'
      ]);
    });


    verify('message-flow-trigger-start-event', () => {

      // when
      signal({
        element: element('M_FLOW')
      });

      // then
      expectTrace([
        'createScope:M_FLOW:null',
        'signal:M_FLOW:0xhsq77',
        'exit:M_FLOW:0xhsq77',
        'createScope:PART_EXP:null',
        'destroyScope:M_FLOW:0xhsq77',
        'signal:PART_EXP:0k46v72',
        'createScope:START:0k46v72',
        'signal:START:047785r',
        'exit:START:047785r',
        'createScope:Flow_1:0k46v72',
        'destroyScope:START:047785r',
        'enter:Flow_1:0k46v72',
        'exit:Flow_1:1847vhq',
        'createScope:END:0k46v72',
        'destroyScope:Flow_1:1847vhq',
        'enter:END:0k46v72',
        'exit:END:0fxdemj',
        'destroyScope:END:0fxdemj',
        'exit:PART_EXP:0k46v72',
        'destroyScope:PART_EXP:0k46v72'
      ]);
    });


    verify('message-flow-throw-catch-events', () => {

      // when
      signal({
        element: element('PART_A')
      });

      // then
      expectTrace([
        'createScope:PART_A:null',
        'signal:PART_A:08v5y2h',
        'createScope:START:08v5y2h',
        'signal:START:0ojqmfu',
        'exit:START:0ojqmfu',
        'createScope:Flow_2:08v5y2h',
        'destroyScope:START:0ojqmfu',
        'enter:Flow_2:08v5y2h',
        'exit:Flow_2:0sqidhh',
        'createScope:THROW_M:08v5y2h',
        'destroyScope:Flow_2:0sqidhh',
        'enter:THROW_M:08v5y2h',
        'createScope:M_FLOW_A:null',
        'signal:M_FLOW_A:0uz2498',
        'exit:THROW_M:17m3ehw',
        'createScope:Flow_7:08v5y2h',
        'destroyScope:THROW_M:17m3ehw',
        'exit:M_FLOW_A:0uz2498',
        'createScope:PART_B:null',
        'destroyScope:M_FLOW_A:0uz2498',
        'enter:Flow_7:08v5y2h',
        'signal:PART_B:17w20y6',
        'createScope:START_B:17w20y6',
        'exit:Flow_7:03sspwq',
        'createScope:CATCH_M:08v5y2h',
        'destroyScope:Flow_7:03sspwq',
        'signal:START_B:1o5r87i',
        'enter:CATCH_M:08v5y2h',
        'exit:START_B:1o5r87i',
        'createScope:Flow_3:17w20y6',
        'destroyScope:START_B:1o5r87i',
        'enter:Flow_3:17w20y6',
        'exit:Flow_3:01sw2v9',
        'createScope:END_B:17w20y6',
        'destroyScope:Flow_3:01sw2v9',
        'enter:END_B:17w20y6',
        'createScope:M_FLOW_B:null',
        'signal:M_FLOW_B:1ma3b30',
        'exit:END_B:0mwwucq',
        'destroyScope:END_B:0mwwucq',
        'exit:M_FLOW_B:1ma3b30',
        'destroyScope:M_FLOW_B:1ma3b30',
        'exit:PART_B:17w20y6',
        'destroyScope:PART_B:17w20y6',
        'signal:CATCH_M:02fqdk8',
        'exit:CATCH_M:02fqdk8',
        'createScope:Flow_4:08v5y2h',
        'destroyScope:CATCH_M:02fqdk8',
        'enter:Flow_4:08v5y2h',
        'exit:Flow_4:1ep2dy6',
        'createScope:END:08v5y2h',
        'destroyScope:Flow_4:1ep2dy6',
        'enter:END:08v5y2h',
        'exit:END:1mva4zu',
        'destroyScope:END:1mva4zu',
        'exit:PART_A:08v5y2h',
        'destroyScope:PART_A:08v5y2h'
      ]);
    });


    verify('message-flow-dependent-processes', () => {

      // when
      signal({
        element: element('PART_A')
      });

      // then
      expectTrace([
        'createScope:PART_A:null',
        'signal:PART_A:0nv9f99',
        'createScope:START:0nv9f99',
        'signal:START:0tbs7pj',
        'exit:START:0tbs7pj',
        'createScope:Flow_2:0nv9f99',
        'destroyScope:START:0tbs7pj',
        'enter:Flow_2:0nv9f99',
        'exit:Flow_2:1jjhie9',
        'createScope:TASK_S:0nv9f99',
        'destroyScope:Flow_2:1jjhie9',
        'enter:TASK_S:0nv9f99',
        'createScope:M_FLOW_A:null',
        'signal:M_FLOW_A:14wfime',
        'exit:TASK_S:1ia5olg',
        'createScope:Flow_1:0nv9f99',
        'destroyScope:TASK_S:1ia5olg',
        'exit:M_FLOW_A:14wfime',
        'createScope:PART_B:null',
        'destroyScope:M_FLOW_A:14wfime',
        'enter:Flow_1:0nv9f99',
        'signal:PART_B:0aog30j',
        'createScope:START_B:0aog30j',
        'exit:Flow_1:0ix4mix',
        'createScope:TASK_R:0nv9f99',
        'destroyScope:Flow_1:0ix4mix',
        'signal:START_B:0zan2hu',
        'enter:TASK_R:0nv9f99',
        'exit:START_B:0zan2hu',
        'createScope:Flow_3:0aog30j',
        'destroyScope:START_B:0zan2hu',
        'enter:Flow_3:0aog30j',
        'exit:Flow_3:09k6ev6',
        'createScope:END_B:0aog30j',
        'destroyScope:Flow_3:09k6ev6',
        'enter:END_B:0aog30j',
        'createScope:M_FLOW_B:null',
        'signal:M_FLOW_B:1xv1oaj',
        'exit:END_B:1841u6v',
        'destroyScope:END_B:1841u6v',
        'exit:M_FLOW_B:1xv1oaj',
        'destroyScope:M_FLOW_B:1xv1oaj',
        'exit:PART_B:0aog30j',
        'destroyScope:PART_B:0aog30j',
        'signal:TASK_R:1iamo65',
        'exit:TASK_R:1iamo65',
        'createScope:Flow_4:0nv9f99',
        'destroyScope:TASK_R:1iamo65',
        'enter:Flow_4:0nv9f99',
        'exit:Flow_4:1dydpwz',
        'createScope:END:0nv9f99',
        'destroyScope:Flow_4:1dydpwz',
        'enter:END:0nv9f99',
        'exit:END:094oey2',
        'destroyScope:END:094oey2',
        'exit:PART_A:0nv9f99',
        'destroyScope:PART_A:0nv9f99'
      ]);
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


    verify('message-flow-signal-active-participant', () => {

      // when
      signal({
        element: element('Participant_A')
      });

      // then
      expectTrace([
        'createScope:Participant_A:null',
        'signal:Participant_A:A',
        'createScope:Start_A:A',
        'signal:Start_A:C',
        'exit:Start_A:C',
        'createScope:Flow_1:A',
        'destroyScope:Start_A:C',
        'enter:Flow_1:A',
        'exit:Flow_1:D',
        'createScope:Task_A:A',
        'destroyScope:Flow_1:D',
        'enter:Task_A:A',
        'createScope:Message_Flow_1:null',
        'createScope:Message_Flow_2:null',
        'signal:Message_Flow_1:E',
        'signal:Message_Flow_2:F',
        'exit:Task_A:0fctkqw',
        'createScope:Flow_2:A',
        'destroyScope:Task_A:0fctkqw',
        'exit:Message_Flow_1:E',
        'createScope:Participant_B:null',
        'destroyScope:Message_Flow_1:E',
        'exit:Message_Flow_2:F',
        'destroyScope:Message_Flow_2:F',
        'enter:Flow_2:A',
        'signal:Participant_B:B',
        'createScope:Start_B:B',
        'exit:Flow_2:G',
        'createScope:End_A:A',
        'destroyScope:Flow_2:G',
        'signal:Start_B:H',
        'enter:End_A:A',
        'exit:Start_B:H',
        'createScope:Flow_3:B',
        'destroyScope:Start_B:H',
        'exit:End_A:I',
        'destroyScope:End_A:I',
        'enter:Flow_3:B',
        'exit:Participant_A:A',
        'destroyScope:Participant_A:A',
        'exit:Flow_3:J',
        'createScope:End_B:B',
        'destroyScope:Flow_3:J',
        'enter:End_B:B',
        'exit:End_B:K',
        'destroyScope:End_B:K',
        'exit:Participant_B:B',
        'destroyScope:Participant_B:B'
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
                simulationTrace.push(event);
              });
            }
          ],
          simulationScopes: [ 'value', {} ],
          simulationTrace: [ 'value', [] ]
        }
      ]
    }).call(this);

    expect(err).not.to.exist;

    expect(warnings).to.be.empty;

    return getBpmnJS().invoke(test);
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

  expect(trace).to.eql(adjustedExpectedTrace);
}