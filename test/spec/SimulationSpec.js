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


    it('should continue flow', inject(
      async function(simulator, exclusiveGatewaySettings) {

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

    const diagram = require('./boundary-event.bpmn');

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


  describe('sub-process', function() {

    const diagram = require('./boundary-event.bpmn');

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


  describe('event sub process', function() {

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
        triggerElement('START');

        const {
          scope
        } = await elementEnter('CATCH_M');

        triggerElement('CATCH_M');

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
        animation.setAnimationSpeed(200);

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


function triggerElement(id) {

  return getBpmnJS().invoke(function(bpmnjs) {

    const domElement = domQuery(
      `.djs-overlays[data-container-id="${id}"] .context-pad`,
      bpmnjs._container
    );

    if (!domElement) {
      throw new Error(`no context pad on on <${id}>`);
    }

    triggerClick(domElement);
  });
}


function triggerScope(scope) {

  return getBpmnJS().invoke(function(bpmnjs) {

    const domElement = domQuery(
      `.token-simulation-scopes [data-scope-id="${scope.id}"]`,
      bpmnjs._container
    );

    if (!domElement) {
      throw new Error(`no scope toggle for <${scope.id}>`);
    }

    triggerClick(domElement);
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