import ModelerModule from 'lib/modeler';

import {
  bootstrapModeler,
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

const TestModule = {
  __init__: [
    function(eventBus, animation) {
      animation.setAnimationSpeed(100);

      eventBus.on(TRACE_EVENT, function(event) {

        if (event.action === 'enter') {
          eventBus.fire(ENTER_EVENT, event);
        }
      });
    }
  ],
  trace: [ 'type', Log ]
};


describe('simulation', function() {

  describe('basic', function() {

    const diagram = require('./simple.bpmn');

    let processElement,
        gateway;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode, trace) {
      processElement = elementRegistry.get('Process_1');
      gateway = elementRegistry.get('ExclusiveGateway_1');

      toggleMode.toggleMode();

      trace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator) {

        // when
        simulator.signal({
          element: processElement
        });

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
      async function(simulator, exclusiveGatewaySettings) {

        // given
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        // when
        simulator.signal({
          element: processElement
        });

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


    it('should continue flow', inject(
      async function(simulator, exclusiveGatewaySettings) {

        // given
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        // when
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        // when
        simulator.signal({
          element: processElement
        });

        const context = await elementEnter('IntermediateCatchEvent_1');

        continueFlow(context);

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
      async function(simulator, exclusiveGatewaySettings, scopeFilter) {

        // given
        exclusiveGatewaySettings.setSequenceFlow(gateway);
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        simulator.signal({
          element: processElement
        });

        simulator.signal({
          element: processElement
        });

        const {
          scope
        } = await elementEnter('IntermediateCatchEvent_1');

        const {
          scope: otherScope
        } = await elementEnter('IntermediateCatchEvent_1');

        // when
        scopeFilter.toggle(scope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.true;
        expect(scopeFilter.isShown(otherScope)).to.be.false;

        // but when
        scopeFilter.toggle(scope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.true;
        expect(scopeFilter.isShown(otherScope)).to.be.true;

        // but when
        scopeFilter.toggle(scope);
        scopeFilter.toggle(otherScope);

        // then
        expect(scopeFilter.isShown(scope)).to.be.false;
        expect(scopeFilter.isShown(otherScope)).to.be.true;
      }
    ));

  });


  describe('sub-process', function() {

    const diagram = require('./boundary-event.bpmn');

    let processElement;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode, trace) {
      processElement = elementRegistry.get('Process_1');

      toggleMode.toggleMode();

      trace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator, elementRegistry) {

        // when
        simulator.signal({
          element: processElement
        });

        const {
          scope
        } = await elementEnter('SUB');

        const {
          scope: childScope
        } = await elementEnter('ReceiveTask');

        continueFlow({
          element: elementRegistry.get('ReceiveTask'),
          scope: childScope
        });

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
        simulator.signal({
          element: processElement
        });

        const { scope } = await elementEnter('SUB');

        // when
        // trigger boundary
        continueFlow({
          element: elementRegistry.get('TIMER_BOUNDARY'),
          scope
        });

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_1',
          'SUB',
          'START_SUB',
          'Flow_2',
          'ReceiveTask',
          'Flow_6',
          'END_TIMED_OUT'
        ]);
      }
    ));

  });


  describe('event-based gateway', function() {

    const diagram = require('./event-based-gateway.bpmn');

    let processElement;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode, trace) {
      processElement = elementRegistry.get('Process_1');

      toggleMode.toggleMode();

      trace.start();
    }));


    it('should signal catch event', inject(
      async function(simulator, elementRegistry) {

        // when
        simulator.signal({
          element: processElement
        });

        const {
          scope
        } = await elementEnter('G_EVENT');

        simulator.signal({
          scope: simulator.findScope({
            parent: scope,
            element: elementRegistry.get('G_EVENT')
          }),
          element: elementRegistry.get('S_CATCH')
        });

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


  describe('event sub process', function() {

    const diagram = require('./event-sub-process.bpmn');

    let processElement;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode, trace) {
      processElement = elementRegistry.get('Process_1');

      toggleMode.toggleMode();

      trace.start();
    }));


    it('should cancel scope', inject(
      async function(simulator, elementRegistry) {

        // when
        simulator.signal({
          element: processElement
        });

        const {
          scope
        } = await elementEnter('S');

        simulator.signal({
          parentScope: scope,
          element: elementRegistry.get('EVENT_SUB')
        });

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


  describe('message flows', function() {

    const diagram = require('./message-flows.bpmn');

    let processElement;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode, trace) {
      processElement = elementRegistry.get('Participant_2');

      toggleMode.toggleMode();

      trace.start();
    }));


    it('should execute happy path', inject(
      async function(simulator) {

        // when
        simulator.signal({
          element: processElement
        });

        const {
          element,
          scope
        } = await elementEnter('CATCH_M');

        continueFlow({
          element,
          scope
        });

        await scopeDestroyed(scope);

        // then
        expectHistory([
          'START',
          'Flow_2',
          'Task_1',
          'Flow_1',
          'CATCH_M',
          'Flow_3',
          'END'
        ]);
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

function continueFlow(context) {

  // TODO(nikku): make this IntermediateCatchEventHandler a scriptable API

  return getBpmnJS().invoke(function(simulator) {

    const {
      element,
      scope
    } = context;

    setTimeout(function() {

      if (is(element, 'bpmn:BoundaryEvent')) {
        simulator.signal({
          element,
          parentScope: scope
        });
      } else {

        simulator.signal({
          element,
          scope: simulator.findScope({
            element,
            parent: scope
          })
        });
      }

    }, 150);
  });

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

function expectHistory(history) {

  return getBpmnJS().invoke(function(trace) {
    const events = trace.getAll()
      .filter(function(event) {
        return (
          (event.action === 'exit' && is(event.element, 'bpmn:StartEvent')) ||
          (event.action === 'enter')
        );
      })
      .map(function(event) {
        return event.element.id;
      });

    expect(events).to.eql(history);
  });

}

function inject(fn) {
  return function() {

    const bpmnJS = getBpmnJS();

    if (!bpmnJS) {
      throw new Error(
        'no bootstraped bpmn-js instance, ' +
        'ensure you created it via #boostrap(Modeler|Viewer)'
      );
    }

    return bpmnJS.invoke(fn);
  };
}