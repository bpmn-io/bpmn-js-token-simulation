import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler as _bootstrapModeler,
  inject,
  getBpmnJS,
} from 'test/TestHelper';

import Log from 'lib/features/log/Log';

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

function bootstrapModeler(diagram, config) {
  const {
    animation = {},
    ...restConfig
  } = config;

  return _bootstrapModeler(diagram, {
    ...restConfig,
    animation: {
      randomize: false,
      ...animation
    }
  });
}

class LogCollector extends Log {

  constructor(
      eventBus, notifications,
      tokenSimulationPalette, canvas,
      scopeFilter
  ) {

    super(
      eventBus, notifications,
      tokenSimulationPalette, canvas,
      scopeFilter);

    this._elementLog = [];
    this.log = (args) => {

      // only interested in logs related to elements.
      if (/^Process /.test(args.text)) {
        return;
      }

      this._elementLog.push({
        text: args.text,
        icon: args.icon
      });
    };
  }
}


describe('features/log', function() {

  describe('icons', function() {

    const diagram = require('./tasks.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
        {
          log: [ 'type', LogCollector ]
        },
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should render tasks', inject(
      async function() {

        // when
        triggerElement('start');

        await elementEnter('receiveTask');
        triggerElement('receiveTask');

        await scopeDestroyed();

        // then
        expectLog([
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start'
          },
          {
            'icon': 'bpmn-icon-task',
            'text': 'task'
          },
          {
            'icon': 'bpmn-icon-send',
            'text': 'sendTask'
          },
          {
            'icon': 'bpmn-icon-receive',
            'text': 'receiveTask'
          },
          {
            'icon': 'bpmn-icon-user',
            'text': 'userTask'
          },
          {
            'icon': 'bpmn-icon-manual-task',
            'text': 'manualTask'
          },
          {
            'icon': 'bpmn-icon-business-rule',
            'text': 'businessRTask'
          },
          {
            'icon': 'bpmn-icon-service',
            'text': 'serviceTask'
          },
          {
            'icon': 'bpmn-icon-script',
            'text': 'scriptTask'
          },
          {
            'icon': 'bpmn-icon-call-activity',
            'text': 'call_activity'
          },
          {
            'icon': 'bpmn-icon-end-event-none',
            'text': 'end'
          }
        ]);
      }
    ));

  });


  describe('icons - start events', function() {

    const diagram = require('./start-events.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
        {
          log: [ 'type', LogCollector ]
        },
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should render start events', inject(
      async function() {

        // when
        triggerElement('start');
        triggerElement('messageStart');
        triggerElement('signalStart');
        triggerElement('conditionalStart');
        triggerElement('timerStart');

        // then
        expectLog([
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start'
          },
          {
            'icon': 'bpmn-icon-start-event-message',
            'text': 'messageStart'
          },
          {
            'icon': 'bpmn-icon-start-event-signal',
            'text': 'signalStart'
          },
          {
            'icon': 'bpmn-icon-start-event-condition',
            'text': 'conditionalStart'
          },
          {
            'icon': 'bpmn-icon-start-event-timer',
            'text': 'timerStart'
          },
        ]);
      }
    ));

  });


  describe('icons - end events', function() {

    const diagram = require('./end-events.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
        {
          log: [ 'type', LogCollector ]
        },
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should render end events', inject(
      async function() {

        // when
        triggerElement('start1');
        await scopeDestroyed();

        // Log does not include terminate end event due to a bug (#169).
        triggerElement('start2');
        await scopeDestroyed();

        // then
        expectLog([
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start1'
          },
          {
            'icon': 'bpmn-icon-gateway-parallel',
            'text': 'Gateway',
          },
          {
            'icon': 'bpmn-icon-end-event-none',
            'text': 'None'
          },
          {
            'icon': 'bpmn-icon-end-event-message',
            'text': 'Message'
          },
          {
            'icon': 'bpmn-icon-end-event-escalation',
            'text': 'Escalation'
          },
          {
            'icon': 'bpmn-icon-end-event-error',
            'text': 'Error'
          },
          {
            'icon': 'bpmn-icon-end-event-compensation',
            'text': 'Compensation'
          },
          {
            'icon': 'bpmn-icon-end-event-signal',
            'text': 'Signal'
          },
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start2'
          },
        ]);
      }
    ));

  });


  describe('icons - intermediate events', function() {

    const diagram = require('./intermediate-events.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
        {
          log: [ 'type', LogCollector ]
        },
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should render intermediate events', inject(
      async function() {

        // when
        triggerElement('start');

        await elementEnter('MICE');
        triggerElement('MICE');
        await elementEnter('TICE');
        triggerElement('TICE');
        await elementEnter('CICE');
        triggerElement('CICE');

        await scopeDestroyed();

        // then
        expectLog([
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-catch-message',
            'text': 'MICE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-throw-message',
            'text': 'MITE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-catch-timer',
            'text': 'TICE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-throw-escalation',
            'text': 'SICE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-catch-condition',
            'text': 'CICE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-none',
            'text': 'ICE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-throw-link',
            'text': 'LITE'
          },
          {
            'icon': 'bpmn-icon-intermediate-event-catch-link',
            'text': 'LICE'
          },
          {
            'icon': 'bpmn-icon-end-event-none',
            'text': 'end'
          }
        ]);
      }
    ));

  });


  describe('icons - gateways', function() {

    const diagram = require('./gateways.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [
        ModelerModule,
        TestModule,
        {
          log: [ 'type', LogCollector ]
        },
      ]
    }));

    beforeEach(inject(function(simulationSupport) {
      simulationSupport.toggleSimulation();
    }));


    it('should render gateways', inject(
      async function() {

        // when
        triggerElement('start');
        await scopeDestroyed();

        // then
        expectLog([
          {
            'icon': 'bpmn-icon-start-event-none',
            'text': 'start'
          },
          {
            'icon': 'bpmn-icon-gateway-xor',
            'text': 'Exclusive'
          },
          {
            'icon': 'bpmn-icon-gateway-parallel',
            'text': 'Parallel'
          },
          {
            'icon': 'bpmn-icon-gateway-or',
            'text': 'Inclusive'
          },
          {
            'icon': 'bpmn-icon-end-event-none',
            'text': 'End Event'
          }
        ]);
      }
    ));

  });

});


// helpers ////////////////////

function getSimulationSupport() {
  return getBpmnJS().get('simulationSupport');
}

function expectLog(expectedLog) {
  const log = getBpmnJS().get('log');
  expect(log._elementLog, 'log equals').to.eql(expectedLog);
}

function triggerElement(...args) {
  return getSimulationSupport().triggerElement(...args);
}

function scopeDestroyed(...args) {
  return getSimulationSupport().scopeDestroyed(...args);
}

function elementEnter(...args) {
  return getSimulationSupport().elementEnter(...args);
}
