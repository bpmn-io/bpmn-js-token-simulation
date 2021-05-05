import SimulatorModule from 'lib/features/simulator';

import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';


describe.only('simulator', function() {

  const diagram = require('./simple.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      SimulatorModule
    ]
  }));

  let trace = [];

  beforeEach(inject(function(simulator) {
    simulator.on('trace', function(event) {
      console.debug(event.id);

      trace.push(event.id);
    });
  }));


  it('should simulate', inject(function(simulator) {

    // given
    simulator.setConfig(e('ExclusiveGateway_1'), {
      activeOutgoing: e('SequenceFlow_2')
    });

    simulator.exit({
      element: e('StartEvent_1')
    });

    // then
    expectTrace(trace, [
      'exit:StartEvent_1:null',
      'createScope:Process_1:null',
      'enter:SequenceFlow_1:A',
      'exit:SequenceFlow_1:A',
      'enter:Task_1:A',
      'exit:Task_1:A',
      'enter:SequenceFlow_1wm1e59:A',
      'exit:SequenceFlow_1wm1e59:A',
      'enter:ExclusiveGateway_1:A',
      'exit:ExclusiveGateway_1:A',
      'enter:SequenceFlow_2:A',
      'exit:SequenceFlow_2:A',
      'enter:Task_2:A',
      'exit:Task_2:A',
      'enter:SequenceFlow_3:A',
      'exit:SequenceFlow_3:A',
      'enter:EndEvent_1:A',
      'destroyScope:Process_1:A'
    ]);
  }));

});

function e(id) {
  return getBpmnJS().invoke(function(elementRegistry) {
    return elementRegistry.get(id);
  });
}


function expectTrace(trace, expected) {

  const traceSplit = trace.map(e => e.split(':'));

  const expectedSplit = expected.map(e => e.split(':'));

  // TODO(nikku): real trace IDs should be mapped to virtual ones
}