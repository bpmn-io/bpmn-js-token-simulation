import ModelerModule from 'lib/modeler';

import {
  query as domQuery
} from 'min-dom';

import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import * as AllEvents from 'lib/util/EventHelper';

import {
  TRACE_EVENT,
  SCOPE_DESTROYED_EVENT
} from 'lib/util/EventHelper';

import { is } from 'lib/util/ElementHelper';

import {
  assign,
  forEach
} from 'min-dash';

const VERY_HIGH_PRIORITY = 100000;

const ENTER_EVENT = 'trace.elementEnter';
const EXIT_EVENT = 'trace.elementExit';

const TestModule = {
  __init__: [
    function(eventBus, animation) {
      animation.setAnimationSpeed(100);

      eventBus.on(TRACE_EVENT, function(event) {

        if (event.action === 'enter') {
          eventBus.fire(ENTER_EVENT, event);
        }

        if (event.action === 'exit') {
          eventBus.fire(EXIT_EVENT, event);
        }
      });
    }
  ],
  trace: [ 'type', Log ]
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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


  describe('event-based gateway', function() {

    const diagram = require('./event-based-gateway.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

      beforeEach(inject(function(toggleMode, trace) {
        toggleMode.toggleMode();

        trace.start();
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

      beforeEach(inject(function(toggleMode, trace) {
        toggleMode.toggleMode();

        trace.start();
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

      beforeEach(inject(function(toggleMode, trace) {
        toggleMode.toggleMode();

        trace.start();
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

      beforeEach(inject(function(toggleMode, trace) {
        toggleMode.toggleMode();

        trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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
        triggerElement('SIGNAL_RETHROW');

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

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
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

});


// helpers //////////

function Log(eventBus) {
  this.eventBus = eventBus;

  this.events = [];

  this._log = this._log.bind(this);
}

Log.prototype._log = function(event) {
  this.events.push(assign({}, event));
};

Log.prototype.start = function() {
  forEach(AllEvents, event => {
    this.eventBus.on(event, VERY_HIGH_PRIORITY, this._log);
  });
};

Log.prototype.stop = function() {
  forEach(AllEvents, event => {
    this.eventBus.on(event, this._log);
  });
};

Log.prototype.clear = function() {
  this.stop();

  this.events = [];
};

Log.prototype.getAll = function() {
  return this.events;
};

function ifElement(id, fn) {
  return function(event) {
    var element = event.element;

    if (element.id === id) {
      fn(event);
    }
  };
}


function getElementTrigger(id) {
  return getBpmnJS().invoke(function(bpmnjs) {
    return domQuery(
      `.djs-overlays[data-container-id='${id}'] .bts-context-pad:not(.hidden)`,
      bpmnjs._container
    );
  });
}

function getScopeTrigger(scope) {
  return getBpmnJS().invoke(function(bpmnjs) {
    return domQuery(
      `.bts-scopes [data-scope-id='${scope.id}']`,
      bpmnjs._container
    );
  });
}

function expectNoElementTrigger(id) {

  const domElement = getElementTrigger(id);

  expect(domElement, `element trigger exist for <${id}>`).not.to.exist;
}

function expectElementTrigger(id) {

  const domElement = getElementTrigger(id);

  expect(domElement, `no element trigger for <${id}>`).to.exist;

  return domElement;
}

function expectScopeTrigger(scope) {

  const domElement = getScopeTrigger(scope);

  expect(domElement, `no scope trigger for <${scope.id}>`).to.exist;

  return domElement;
}

function triggerElement(id) {
  const domElement = expectElementTrigger(id);

  triggerClick(domElement);
}


function triggerScope(scope) {
  const domElement = expectScopeTrigger(scope);

  triggerClick(domElement);
}

function scopeDestroyed(scope=null) {

  return new Promise(resolve => {

    return getBpmnJS().invoke(function(eventBus) {

      const listener = function(event) {

        if (scope && event.scope !== scope) {
          return;
        }

        const scopeElements = [
          'bpmn:Participant',
          'bpmn:Process',
          'bpmn:SubProcess'
        ];

        if (scopeElements.every(t => !is(event.scope.element, t))) {
          return;
        }

        eventBus.off(SCOPE_DESTROYED_EVENT, listener);

        return resolve(event);
      };

      eventBus.on(SCOPE_DESTROYED_EVENT, listener);
    });
  });
}

function elementEnter(id=null) {

  return new Promise(resolve => {

    return getBpmnJS().invoke(function(eventBus) {

      const wrap = id ? (fn) => ifElement(id, fn) : fn => fn;

      const listener = wrap(function(event) {
        eventBus.off(ENTER_EVENT, listener);

        return resolve(event);
      });

      eventBus.on(ENTER_EVENT, listener);
    });
  });
}


function elementExit(id=null) {

  return new Promise(resolve => {

    return getBpmnJS().invoke(function(eventBus) {

      const wrap = id ? (fn) => ifElement(id, fn) : fn => fn;

      const listener = wrap(function(event) {
        eventBus.off(EXIT_EVENT, listener);

        return resolve(event);
      });

      eventBus.on(EXIT_EVENT, listener);
    });
  });
}

function expectHistory(history) {

  return getBpmnJS().invoke(function(trace) {
    const events = trace.getAll()
      .filter(function(event) {
        return (
          (event.action === 'exit' && (
            is(event.element, 'bpmn:StartEvent') ||
            is(event.element, 'bpmn:BoundaryEvent')
          )) ||
          (event.action === 'enter')
        );
      })
      .map(function(event) {
        return event.element.id;
      });

    expect(events).to.eql(history);
  });

}


function triggerClick(element, options={}) {

  const defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  };

  options = Object.assign({}, defaultOptions, options);

  const event = document.createEvent('MouseEvents');

  event.initMouseEvent(
    'click',
    options.bubbles,
    options.cancelable,
    document.defaultView,
    options.button,
    options.pointerX,
    options.pointerY,
    options.pointerX,
    options.pointerY,
    options.ctrlKey,
    options.altKey,
    options.shiftKey,
    options.metaKey,
    options.button,
    element
  );

  element.dispatchEvent(event);
}