import ModelerModule from 'lib/modeler';

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
  ]
};


describe('token simulation', function() {

  const diagram = require('./simple.bpmn');

  let startEvent,
      gateway;

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));

  beforeEach(inject(function(elementRegistry, toggleMode) {
    startEvent = elementRegistry.get('StartEvent_1');
    gateway = elementRegistry.get('ExclusiveGateway_1');

    toggleMode.toggleMode();
  }));


  it('should finish simulation at EndEvent_1', function(done) {
    inject(function(eventBus, simulator) {

      // given
      const log = new Log(eventBus);

      log.start();

      eventBus.once(SCOPE_DESTROYED_EVENT, function() {

        // then
        expectHistory(log, [
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

        done();
      });

      // when
      simulator.signal({
        element: startEvent
      });
    })();
  });


  it('should finish simulation at EndEvent_2', function(done) {
    inject(function(eventBus, simulator, exclusiveGatewaySettings) {

      // given
      const log = new Log(eventBus);

      log.start();

      // assume user clicks to select next sequence flow
      exclusiveGatewaySettings.setSequenceFlow(gateway);

      eventBus.once(SCOPE_DESTROYED_EVENT, function() {

        // then
        expectHistory(log, [
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

        done();
      });

      // when
      simulator.signal({
        element: startEvent
      });
    })();
  });


  it('should finish simulation at EndEvent_3', function(done) {
    inject(function(eventBus, simulator, exclusiveGatewaySettings) {

      // given
      const log = new Log(eventBus);

      log.start();

      // assume user clicks to select next sequence flow twice
      exclusiveGatewaySettings.setSequenceFlow(gateway);
      exclusiveGatewaySettings.setSequenceFlow(gateway);

      eventBus.once(SCOPE_DESTROYED_EVENT, function() {

        // then
        expectHistory(log, [
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

        done();
      });

      // assume user clicks to generate token
      eventBus.on(ENTER_EVENT, ifElement('IntermediateCatchEvent_1', continueFlow));

      // when
      simulator.signal({
        element: startEvent
      });
    })();
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

  getBpmnJS().invoke(function(simulator) {

    const {
      element,
      scope
    } = context;

    setTimeout(function() {

      simulator.signal({
        element,
        scope
      });
    }, 150);
  });

}

function expectHistory(log, history) {
  const events = log.getAll()
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
}