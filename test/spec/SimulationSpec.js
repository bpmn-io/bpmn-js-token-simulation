import ModelerModule from 'lib/modeler';

import Animation from 'test/mocks/Animation';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import EventHelper, {
  CONSUME_TOKEN_EVENT,
  GENERATE_TOKEN_EVENT,
  PROCESS_INSTANCE_CREATED_EVENT,
  PROCESS_INSTANCE_FINISHED_EVENT
} from 'lib/util/EventHelper';

import { is } from 'lib/util/ElementHelper';

import {
  assign,
  forEach
} from 'min-dash';

var VERY_HIGH_PRIORITY = 100000;


describe('token simulation', function() {

  describe('simple', function() {

    const diagram = require('./simple.bpmn');

    let startEvent,
        gateway;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        Animation
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode) {
      startEvent = elementRegistry.get('StartEvent_1');
      gateway = elementRegistry.get('ExclusiveGateway_1');

      toggleMode.toggleMode();
    }));


    it('should finish simulation at EndEvent_1', function(done) {
      inject(function(eventBus) {

        // given
        const log = new Log(eventBus);

        log.start();

        eventBus.once(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'Task_1',
            'ExclusiveGateway_1',
            'Task_2',
            'EndEvent_1'
          ]);

          done();
        });

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });


    it('should finish simulation at EndEvent_2', function(done) {
      inject(function(eventBus, exclusiveGatewaySettings) {

        // given
        const log = new Log(eventBus);

        log.start();

        // assume user clicks to select next sequence flow
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        eventBus.once(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'Task_1',
            'ExclusiveGateway_1',
            'Task_3',
            'EndEvent_2'
          ]);

          done();
        });

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });


    it('should finish simulation at EndEvent_3', function(done) {
      inject(function(eventBus, exclusiveGatewaySettings) {

        // given
        const log = new Log(eventBus);

        log.start();

        // assume user clicks to select next sequence flow twice
        exclusiveGatewaySettings.setSequenceFlow(gateway);
        exclusiveGatewaySettings.setSequenceFlow(gateway);

        eventBus.once(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'Task_1',
            'ExclusiveGateway_1',
            'IntermediateCatchEvent_1',
            'EndEvent_3'
          ]);

          done();
        });

        // assume user clicks to generate token
        eventBus.on(CONSUME_TOKEN_EVENT, ifElement('IntermediateCatchEvent_1', function(event) {
          var element = event.element,
              processInstanceId = event.processInstanceId;

          eventBus.fire(GENERATE_TOKEN_EVENT, {
            element: element,
            processInstanceId: processInstanceId
          });
        }));

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });

  });


  describe('subprocess', function() {

    const diagram = require('./subprocess.bpmn');

    let startEvent;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        Animation
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode) {
      startEvent = elementRegistry.get('StartEvent_1');

      toggleMode.toggleMode();
    }));


    it('should finish simulation at EndEvent_1', function(done) {
      inject(function(eventBus) {

        // given
        const log = new Log(eventBus);

        log.start();

        eventBus.on(PROCESS_INSTANCE_FINISHED_EVENT, ifProcessInstance(1, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'SubProcess_1',
            'StartEvent_2',
            'Task_1',
            'EndEvent_2',
            'EndEvent_1'
          ]);

          expectProcessInstanceHistory(log, [
            [ 1, 'created' ],
            [ 2, 'created' ],
            [ 2, 'finished' ],
            [ 1, 'finished' ]
          ]);

          done();
        }));

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });

  });


  describe('intermediate-events', function() {

    const diagram = require('./intermediate-events.bpmn');

    let startEvent;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        Animation
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode) {
      startEvent = elementRegistry.get('StartEvent_1');

      toggleMode.toggleMode();
    }));


    it('should start and end simulation when IntermediateEvent is present', function(done) {
      inject(function(eventBus) {

        // given
        const log = new Log(eventBus);

        log.start();

        eventBus.once(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'Task_1',
            'IntermediateEvent',
            'EndEvent_1'
          ]);

          done();
        });

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });

  });


  describe('message-flow', function() {

    const diagram = require('./message-flow.bpmn');

    let startEvent;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        Animation
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode) {
      startEvent = elementRegistry.get('StartEvent_1');
      toggleMode.toggleMode();
    }));


    it('should run and finish simulation when messageFlow elements present', function(done) {
      inject(function(eventBus) {

        // given
        const log = new Log(eventBus);

        log.start();

        eventBus.once(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          // then
          expectHistory(log, [
            'StartEvent_1',
            'Task_1',
            'EndEvent_1'
          ]);

          done();
        });

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });
  });


  describe('boundary-events', function() {

    const diagram = require('./boundary-event.bpmn');

    let startEvent;

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        Animation
      ]
    }));

    beforeEach(inject(function(elementRegistry, toggleMode) {
      startEvent = elementRegistry.get('StartEvent');

      toggleMode.toggleMode();
    }));


    it('should start and end simulation with boundary events', function(done) {
      inject(function(eventBus, contextPads) {

        // given
        const log = new Log(eventBus);

        log.start();

        let expectScopes = 2;

        eventBus.on(PROCESS_INSTANCE_FINISHED_EVENT, function() {

          expectScopes--;

          // we are still in the sub-process scope
          if (expectScopes) {
            return;
          }

          // then
          expectHistory(log, [
            'StartEvent',
            'SubProcess',
            'StartSubEvent',
            'UserTask',
            'FinishedSubEvent',
            'FinishedEvent'
          ]);

          expect(contextPads.get('SubBoundary')).not.to.exist;

          done();
        });

        // when
        eventBus.fire(GENERATE_TOKEN_EVENT, {
          element: startEvent
        });
      })();
    });

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
  var self = this;

  forEach(EventHelper, function(event) {
    self.eventBus.on(event, VERY_HIGH_PRIORITY, self._log);
  });
};

Log.prototype.stop = function() {
  var self = this;

  forEach(EventHelper, function(event) {
    self.eventBus.off(event, self._log);
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

function ifProcessInstance(id, fn) {
  return function(event) {
    var processInstanceId = event.processInstanceId;

    if (processInstanceId === id) {
      fn(event);
    }
  };
}

function expectHistory(log, history) {
  const events = log.getAll()
    .filter(function(event) {
      return event.type === CONSUME_TOKEN_EVENT ||
        (event.type === GENERATE_TOKEN_EVENT && is(event.element, 'bpmn:StartEvent'));
    })
    .map(function(event) {
      return event.element.id;
    });

  expect(events).to.eql(history);
}

function expectProcessInstanceHistory(log, history) {
  const events = log.getAll()
    .filter(function(event) {
      return event.type === PROCESS_INSTANCE_CREATED_EVENT ||
        event.type === PROCESS_INSTANCE_FINISHED_EVENT;
    })
    .map(function(event) {
      return [
        event.processInstanceId,
        event.type === PROCESS_INSTANCE_CREATED_EVENT ? 'created' : 'finished'
      ];
    });

  expect(events).to.eql(history);
}