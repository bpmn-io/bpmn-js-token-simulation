import SimulatorModule from 'lib/features/simulator';

import {
  bootstrapModeler,
  inject
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
      trace.push(event.id);
    });
  }));


  it('should simulate', inject(function(simulator) {

    // given
    simulator.configure('ExclusiveGateway_1', {
      activeOutgoing: 'SequenceFlow_2'
    });

    simulator.signal('StartEvent_1');

    // then
    expect(trace).to.eql([
      'create:StartEvent_1',
      'enter:ExclusiveGateway_1',
      'take:SequenceFlow_2',
      'enter:Task_2',
      'take:SequenceFlow_3',
      'enter:EndEvent_1',
      'end'
    ]);
  }));

});