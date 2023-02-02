import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler,
  inject,
  getBpmnJS,
  withBpmnJs
} from 'test/TestHelper';


const TestModule = {
  __depends__: [
    SimulationSupportModule
  ],
  __init__: [
    function(animation) {
      animation.setAnimationSpeed(100);
    }
  ]
};


describe('simulation', function() {

  describe('basic', function() {

    const diagram = require('./simple.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation();

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator) {

        // when
        triggerElement('StartEvent_1');

        await scopeDestroyed();

        // then
        expectHistory([
          'StartEvent_1',
          'SequenceFlow_1',
          'Task_1',
          'SequenceFlow_1wm1e59',
          'ExclusiveGateway_1',
          'SequenceFlow_2',
          'Task_2',
          'SequenceFlow_3',
          'EndEvent_1'
        ]);
      }
    ));


    it('should choose secondary flow', inject(
      async function(simulator) {

        // given
        triggerElement('ExclusiveGateway_1');

        // when
        triggerElement('StartEvent_1');

        await scopeDestroyed();

        // then
        expectHistory([
          'StartEvent_1',
          'SequenceFlow_1',
          'Task_1',
          'SequenceFlow_1wm1e59',
          'ExclusiveGateway_1',
          'SequenceFlow_4',
          'Task_3',
          'SequenceFlow_5',
          'EndEvent_2'
        ]);
      }
    ));


    describe('pause at node', function() {

      it('should add pause point', inject(
        async function(simulator) {

          // when
          triggerElement('Task_1');

          triggerElement('StartEvent_1');

          await elementEnter('Task_1');

          // then
          expectHistory([
            'StartEvent_1',
            'SequenceFlow_1',
            'Task_1'
          ]);

          // but when
          triggerElement('Task_1');

          await scopeDestroyed();

          // then
          expectHistory([
            'StartEvent_1',
            'SequenceFlow_1',
            'Task_1',
            'SequenceFlow_1wm1e59',
            'ExclusiveGateway_1',
            'SequenceFlow_2',
            'Task_2',
            'SequenceFlow_3',
            'EndEvent_1'
          ]);
        }
      ));


      it('should remove pause point', inject(
        async function(simulator) {

          // given
          triggerElement('Task_1');

          // when
          triggerElement('Task_1');
          triggerElement('StartEvent_1');

          await scopeDestroyed();

          // then
          expectHistory([
            'StartEvent_1',
            'SequenceFlow_1',
            'Task_1',
            'SequenceFlow_1wm1e59',
            'ExclusiveGateway_1',
            'SequenceFlow_2',
            'Task_2',
            'SequenceFlow_3',
            'EndEvent_1'
          ]);
        }
      ));

    });


    it('should continue flow', inject(
      async function(simulator) {

        // given
        triggerElement('ExclusiveGateway_1');

        // when
        triggerElement('ExclusiveGateway_1');

        // when
        triggerElement('StartEvent_1');

        await elementEnter('IntermediateCatchEvent_1');

        triggerElement('IntermediateCatchEvent_1');

        await scopeDestroyed();

        // then
        expectHistory([
          'StartEvent_1',
          'SequenceFlow_1',
          'Task_1',
          'SequenceFlow_1wm1e59',
          'ExclusiveGateway_1',
          'SequenceFlow_6',
          'IntermediateCatchEvent_1',
          'SequenceFlow_1ijnj3k',
          'EndEvent_3'
        ]);
      }
    ));


    it('should select scope', inject(
      async function(simulator, scopeFilter) {

        // given
        triggerElement('ExclusiveGateway_1');
        triggerElement('ExclusiveGateway_1');

        triggerElement('StartEvent_1');
        triggerElement('StartEvent_1');

        const {
          scope
        } = await elementEnter('IntermediateCatchEvent_1');

        const {
          scope: otherScope
        } = await elementEnter('IntermediateCatchEvent_1');

        // when
        triggerScope(scope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.true;
        expect(scopeFilter.isShown(otherScope)).to.be.false;

        // but when
        triggerScope(scope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.true;
        expect(scopeFilter.isShown(otherScope)).to.be.true;

        // but when
        triggerScope(scope);
        triggerScope(otherScope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.false;
        expect(scopeFilter.isShown(otherScope)).to.be.true;
      }
    ));

  });


  describe('components', function() {

    const diagram = require('./sub-process.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));


    describe('pauseSimulation', function() {

      it('should toggle', inject(function(pauseSimulation) {

        // assume
        pauseSimulation.toggle();
        pauseSimulation.toggle();

      }));

    });


    describe('showScopes', function() {

      it('should highlight scope', inject(function(elementRegistry, showScopes) {

        // given
        const subProcessElement = elementRegistry.get('SUB');
        const processElement = elementRegistry.get('Process_1');

        // assume
        showScopes.highlightScope(subProcessElement);

        showScopes.highlightScope(processElement);

        showScopes.unhighlightScope(processElement);
      }));

    });

  });


  describe('pause', function() {

    const diagram = require('./pause.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));


    it('should not show on receive task', inject(function() {

      // then
      expectNoElementTrigger('RECEIVE');
    }));

  });


  describe('links', function() {

    const diagram = require('./links.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation();

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START');

        await elementEnter('RECEIVE');

        expectNoElementTrigger('CATCH_A');
        expectNoElementTrigger('CATCH_UNNAMED');

        triggerElement('RECEIVE');

        await scopeDestroyed();

        // then
        expectHistory([
          'START',
          'Flow_1',
          'THROW_A',
          'Flow_6',
          'RECEIVE',
          'Flow_2',
          'THROW_UNNAMED',
          'Flow_3',
          'S',
          'S_START',
          'Flow_5',
          'S_THROW_A',
          'Flow_7',
          'S_END',
          'Flow_4'
        ]);
      }
    ));

  });


  describe('sub-process', function() {

    const diagram = require('./sub-process.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START');

        const {
          scope
        } = await elementEnter('SUB');

        await elementEnter('ReceiveTask');

        triggerElement('ReceiveTask');

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_1',
          'SUB',
          'START_SUB',
          'Flow_2',
          'ReceiveTask',
          'Flow_4',
          'END_SUB',
          'Flow_3',
          'END'
        ]);
      }
    ));


    it('should trigger interrupting boundary', inject(
      async function(simulator, elementRegistry) {

        // given
        triggerElement('START');

        const { scope } = await elementEnter('SUB');

        // when
        // trigger boundary
        triggerElement('TIMER_BOUNDARY');

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_1',
          'SUB',
          'START_SUB',
          'Flow_2',
          'TIMER_BOUNDARY',
          'Flow_6',
          'END_TIMED_OUT'
        ]);
      }
    ));

  });


  describe('collapsed sub-process', function() {

    const diagram = require('./collapsed-sub-process.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    withBpmnJs('>=9')('should execute happy path', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START');

        const {
          scope
        } = await elementEnter('SUB');

        await elementEnter('ReceiveTask');

        triggerElement('ReceiveTask');

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_1',
          'SUB',
          'START_SUB',
          'Flow_2',
          'ReceiveTask',
          'Flow_4',
          'END_SUB',
          'Flow_3',
          'END'
        ]);
      }
    ));

  });


  describe('event-based gateway', function() {

    const diagram = require('./event-based-gateway.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should signal catch event', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START');

        const {
          scope
        } = await elementEnter('G_EVENT');

        triggerElement('S_CATCH');

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_1',
          'G_EVENT',
          'Flow_5',
          'END_B'
        ]);
      }
    ));

  });


  describe('event sub-process', function() {

    const diagram = require('./event-sub-process.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should not show wait toggle', inject(
      async function(simulator) {

        // assume
        // not breakpoint toggling on event sub
        expectNoElementTrigger('EVENT_SUB');
      }
    ));


    it('should cancel scope', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START');

        const {
          scope
        } = await elementEnter('S');

        triggerElement('START_SUB');

        await elementEnter('END_SUB');

        // then
        expect(scope.destroyed).to.be.true;

        expectHistory([
          'START',
          'Flow_5',
          'S',
          'START_S',
          'Flow_6',
          'START_SUB',
          'Flow_3',
          'END_SUB'
        ]);
      }
    ));

  });


  describe('transaction', function() {

    const diagram = require('./transaction.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should cancel via cancel end', inject(
      async function(simulator, animation, elementRegistry) {

        // given
        // pause at compensation
        triggerElement('Compensate_A');

        // when
        triggerElement('START');

        await elementEnter('Compensate_A');

        // then
        expectNoElementTrigger('CANCEL_BOUNDARY');

        // but when
        // resume compensation
        triggerElement('Compensate_A');

        await elementExit('CANCELED_END');

        // then
        expectHistory([
          'START',
          'Flow_1',
          'T',
          'T_START',
          'Flow_3',
          'Transactional_A',
          'Flow_4',
          'Transactional_B',
          'Flow_5',
          'T_END',
          'Compensate_B',
          'Compensate_A',
          'CANCEL_BOUNDARY',
          'Flow_8',
          'CANCELED_END'
        ]);
      }
    ));


    it('should cancel via cancel boundary', inject(
      async function(simulator, animation, elementRegistry) {

        // given
        // pause at compensation
        triggerElement('Compensate_A');

        // pause at B
        triggerElement('Transactional_B');

        // when
        triggerElement('START');

        await elementEnter('Transactional_B');

        // cancel transaction
        triggerElement('CANCEL_BOUNDARY');

        // resume compensation
        triggerElement('Compensate_A');

        await elementExit('CANCELED_END');

        // then
        expectHistory([
          'START',
          'Flow_1',
          'T',
          'T_START',
          'Flow_3',
          'Transactional_A',
          'Flow_4',
          'Transactional_B',
          'Compensate_A',
          'CANCEL_BOUNDARY',
          'Flow_8',
          'CANCELED_END'
        ]);
      }
    ));

  });


  describe('compensation', function() {

    describe('basic', function() {

      const diagram = require('./compensation.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [
          ModelerModule,
          TestModule
        ]
      }));

      beforeEach(inject(function(simulationSupport, simulationTrace) {
        simulationSupport.toggleSimulation(true);

        simulationTrace.start();
      }));


      it('should execute happy path', inject(
        async function(simulator, elementRegistry) {

          // when
          triggerElement('START');

          await scopeDestroyed();

          // then
          expectHistory([
            'START',
            'Flow_0i0rqg0',
            'A',
            'Flow_0xla1ox',
            'TRIGGER_COMP_A',
            'Compensate_A',
            'Flow_06me3st',
            'END'
          ]);
        }
      ));

    });


    describe('keep-alive', function() {

      const diagram = require('./compensation-keep-alive.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [
          ModelerModule,
          TestModule
        ]
      }));

      beforeEach(inject(function(simulationSupport, simulationTrace) {
        simulationSupport.toggleSimulation(true);

        simulationTrace.start();
      }));


      it('should execute happy path', inject(
        async function(simulator, elementRegistry) {

          // when
          triggerElement('START');

          await elementExit('END');

          // then
          expectHistory([
            'START',
            'Flow_0od01ym',
            'S',
            'S_START',
            'Flow_0i0rqg0',
            'A',
            'Flow_0xla1ox',
            'S_END',
            'Flow_09su6dp',
            'COMPENSATE_S',
            'E_START',
            'Flow_1qtf3zb',
            'E_COMPENSATE_A',
            'Compensate_A',
            'Flow_1p7mdhd',
            'E_END',
            'Flow_0xdj5kb',
            'END'
          ]);
        }
      ));

    });


    describe('errors', function() {

      const diagram = require('./simulator/Simulator.compensation-error.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [
          ModelerModule,
          TestModule
        ]
      }));

      beforeEach(inject(function(simulationSupport, simulationTrace) {
        simulationSupport.toggleSimulation(true);

        simulationTrace.start();
      }));


      it('should execute happy path', inject(
        async function(simulator, elementRegistry) {

          // when
          triggerElement('START');

          await elementExit('ERROR_END');

          // then
          expectHistory([
            'START',
            'Flow_1e0wso1',
            'S',
            'S_START',
            'Flow_1aintfm',
            'Flow_08m3i81',
            'A',
            'Flow_1w8hzat',
            'B',
            'Flow_03xyhan',
            'S_ERROR_END',
            'ERROR_BOUNDARY',
            'Flow_1onzgy6',
            'TRIGGER_COMPENSATE_S',
            'Flow_0ysr4mv',
            'ERROR_END'
          ]);
        }
      ));

    });


    describe('nested', function() {

      const diagram = require('./simulator/Simulator.compensation-nested.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [
          ModelerModule,
          TestModule
        ]
      }));

      beforeEach(inject(function(simulationSupport, simulationTrace) {
        simulationSupport.toggleSimulation(true);

        simulationTrace.start();
      }));


      it('should execute happy path', inject(
        async function(simulator, elementRegistry) {

          // when
          triggerElement('START');

          await elementExit('Process_1');

          // then
          expectHistory([
            'START',
            'Flow_13n73ja',
            'S',
            'S_START',
            'Flow_0v47rw5',
            'SN',
            'SN_START',
            'Flow_1vylnqf',
            'A',
            'Flow_0qwivo3',
            'SX',
            'SX_START',
            'Flow_1wwvx94',
            'B',
            'Flow_09kf045',
            'SF',
            'SF_START',
            'Flow_0zlnrlu',
            'SF_ERROR_END',
            'SF_ERROR_BOUNDARY',
            'Flow_013bc7o',
            'S_END',
            'Flow_09zuhsj',
            'END_COMPENSATE',
            'COMP_B',
            'E_START',
            'Flow_0my3iyg',
            'E_COMP',
            'Flow_1buo09l',
            'E_COMP_END',
            'COMP_A',
            'COMP_S'
          ]);
        }
      ));

    });
  });


  describe('booking', function() {

    const diagram = require('./booking.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator, animation, elementRegistry) {

        // when
        triggerElement('Start');

        await elementExit('Process_1');

        // then
        expectHistory([
          'Start',
          'Flow_140ayua',
          'Gateway_3',
          'Flow_1gfdzi2',
          'Get_Credit_Card_Information',
          'Flow_00gkaxo',
          'Gateway_2',
          'Flow_0bwttxy',
          'Booking_Sub',
          'Start_Booking',
          'Flow_0bqsnls',
          'Flow_0dmzbja',
          'Book_Flight',
          'Flow_0yz8f90',
          'Book_Hotel',
          'Flow_0wsjah5',
          'End_Booking',
          'End_Booking',
          'Flow_096bgm6',
          'Charge_Credit_Card',
          'Flow_1o89wja',
          'End_Booked'
        ]);
      }
    ));


    it('should fail with error', inject(
      async function(simulator, animation, elementRegistry) {

        // assume
        // pause at node
        triggerElement('Book_Flight');

        // when
        triggerElement('Start');

        await elementEnter('Book_Flight');

        // then
        expectElementTrigger('Message_Arrived');
        expectElementTrigger('Booking_Error_Boundary');
        expectElementTrigger('Booking_Error_Start');

        expectNoElementTrigger('Compensation_Start');

        // but when
        triggerElement('Booking_Error_Boundary');

        await elementEnter('Error_Compensate_Flight');

        // then
        expectNoElementTrigger('Message_Arrived');
        expectElementTrigger('Booking_Error_Boundary');

        // but when
        await elementEnter('Notify_Customer_Failed_Booking');

        // then
        expectNoElementTrigger('Booking_Error_Boundary');
        expectNoElementTrigger('Booking_Error_Start');

        expectNoElementTrigger('Compensation_Start');
      }
    ));


    it('should compensate', inject(
      async function(simulator, animation, elementRegistry) {

        // assume
        // pause at node
        triggerElement('Charge_Credit_Card');

        // when
        triggerElement('Start');

        await elementEnter('Charge_Credit_Card');

        // then
        expectNoElementTrigger('Message_Arrived');
        expectNoElementTrigger('Booking_Error_Boundary');
        expectNoElementTrigger('Booking_Error_Start');

        expectElementTrigger('Compensation_Start');
        expectElementTrigger('Book_Flight_Boundary');
        expectElementTrigger('Book_Hotel_Boundary');

        // but when
        // wait at node
        triggerElement('Get_Credit_Card_Information');

        triggerElement('Charge_Credit_Card_Error');

        await elementEnter('Compensation_Compensate_Flight');

        await elementEnter('Get_Credit_Card_Information');

        // then
        expectNoElementTrigger('Message_Arrived');
        expectNoElementTrigger('Booking_Error_Boundary');
        expectNoElementTrigger('Booking_Error_Start');

        expectNoElementTrigger('Compensation_Start');
        expectNoElementTrigger('Book_Flight_Boundary');
        expectNoElementTrigger('Book_Hotel_Boundary');

        expectNoElementTrigger('Compensation_Start');
      }
    ));

  });


  describe('message flows', function() {

    const diagram = require('./message-flows.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator) {

        // when
        triggerElement('A_START');

        await Promise.all([
          elementEnter('TB'),
          elementEnter('R_A')
        ]);

        triggerElement('TB');

        await elementExit('A_END');
      }
    ));

  });


  describe('cancel-events', function() {

    const diagram = require('./cancel-events.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator) {

        // when
        triggerElement('START');

        await elementEnter('S_RECEIVE');

        // then
        expectElementTrigger('E_START');
        expectElementTrigger('TIMEOUT');
        expectElementTrigger('SIGNAL_RETHROW');

        // but when
        // explicitly trigger rethrow signal
        triggerElement('SIGNAL_RETHROW');

        // still invokes event sub-process
        await elementEnter('E_RECEIVE');

        // then
        expectNoElementTrigger('E_START');
        expectNoElementTrigger('TIMEOUT');

        expectElementTrigger('SIGNAL_RETHROW');
        expectElementTrigger('E_RECEIVE');

        // but when
        triggerElement('SIGNAL_RETHROW');

        await elementEnter('END_S_ERROR');

        // then
        expectHistory([
          'START',
          'Flow_1',
          'S',
          'S_START',
          'Flow_3',
          'S_RECEIVE',
          'E_START',
          'Flow_4',
          'E_RECEIVE',
          'SIGNAL_RETHROW',
          'Flow_7',
          'END_S_ERROR'
        ]);
      }
    ));

  });


  describe('all', function() {

    const diagram = require('../../example/resources/all.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should simulate diagram', inject(
      async function(simulator, animation) {

        // given
        animation.setAnimationSpeed(1000);

        // when
        triggerElement('ALL_START');

        // then
        await elementExit('ALL_END');
      }
    ));

  });


  describe('multiple-event-signaling', function() {

    const diagram = require('./multiple-events-signaling.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator, elementRegistry) {

        // when
        triggerElement('START_A');

        const [
          { scope: scope_S1 },
          { scope: scope_S2 },
          { scope: scope_NONE }
        ] = await Promise.all([
          elementExit('END_S1'),
          elementExit('END_S2'),
          elementEnter('EVT_BASED_GATE')
        ]);

        const parentScopes = new Set([
          scope_S1.parent,
          scope_S2.parent,
          scope_NONE.parent,
        ]);

        // then
        // three unique parent scopes
        expect(parentScopes).to.have.length(3);

        // and when
        // trigger first process message wait
        triggerElement('CATCH_M1');

        await elementExit('END_A');

        // then
        expectHistory([
          'START_A',
          'Flow_1',
          'THROW_SIGNAL',
          'Flow_3',
          'START_S1',
          'START_S2',
          'Flow_11',
          'Flow_12',
          'EVT_BASED_GATE',
          'END_S1',
          'END_S2',
          'Flow_7',
          'GATEWAY_3',
          'FLow_10',
          'END_A'
        ]);
      }
    ));

  });


  describe('boundary event', function() {

    const diagram = require('./boundary-events.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(simulationSupport, simulationTrace) {
      simulationSupport.toggleSimulation(true);

      simulationTrace.start();
    }));


    it('should trigger none events independently (first)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('NONE_A');
      await scopeDestroyed();

      // then
      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'NONE_A',
        'FLOW_1',
        'MERGE',
        'FLOW_7',
        'END_B'
      ]);
    });


    it('should trigger none events independently (second)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('NONE_B');
      await scopeDestroyed();

      // then
      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'NONE_B',
        'FLOW_2',
        'MERGE',
        'FLOW_7',
        'END_B'
      ]);
    });


    it('should trigger timer events independently (non-interrupting)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('TIMER_A');

      // then
      await scopeDestroyed();

      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'TIMER_A',
        'FLOW_3',
        'S_END',
        'FLOW_B'
      ]);
    });


    it('should trigger timer events independently (interrupting)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('TIMER_B');

      // then
      await scopeDestroyed();

      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'TIMER_B',
        'FLOW_4',
        'MERGE',
        'FLOW_7',
        'END_B'
      ]);
    });


    it('should trigger conditional events independently (non-interrupting)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('COND_A');

      // then
      await scopeDestroyed();

      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'COND_A',
        'FLOW_5',
        'S_END',
        'FLOW_B'
      ]);
    });


    it('should trigger conditional events independently (interrupting)', async function() {

      // given
      triggerElement('START');

      await elementEnter('ACTIVITY');

      // when
      triggerElement('COND_B');
      await scopeDestroyed();

      // then
      expectHistory([
        'START',
        'FLOW_A',
        'ACTIVITY',
        'S_START',
        'S_FLOW_1',
        'COND_B',
        'FLOW_6',
        'MERGE',
        'FLOW_7',
        'END_B'
      ]);
    });
  });

});


// helpers ////////////////////

function getSimulationSupport() {
  return getBpmnJS().get('simulationSupport');
}

function expectNoElementTrigger(id) {
  const domElement = getSimulationSupport().getElementTrigger(id);

  expect(domElement, `element trigger exist for <${id}>`).not.to.exist;
}

function expectElementTrigger(id) {
  const domElement = getSimulationSupport().getElementTrigger(id);

  expect(domElement, `no element trigger for <${id}>`).to.exist;
}

// eslint-disable-next-line
function expectScopeTrigger(scope) {
  const domElement = getSimulationSupport().getScopeTrigger(scope);

  expect(domElement, `no scope trigger for <${scope.id}>`).to.exist;
}

function expectHistory(expectedHistory) {

  const history = getSimulationSupport().getHistory();

  expect(history, 'history equals').to.eql(expectedHistory);
}

function triggerElement(...args) {
  return getSimulationSupport().triggerElement(...args);
}

function elementEnter(...args) {
  return getSimulationSupport().elementEnter(...args);
}

function elementExit(...args) {
  return getSimulationSupport().elementExit(...args);
}

function triggerScope(...args) {
  return getSimulationSupport().triggerScope(...args);
}

function scopeDestroyed(...args) {
  return getSimulationSupport().scopeDestroyed(...args);
}
