import ModelerModule from 'lib/modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('token-simulation - modeler', function() {

  const diagram = require('example/resources/example.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule
    ]
  }));


  it('should toggle mode', inject(function(toggleMode) {

    // YEA!
    toggleMode.toggleMode();
  }));

});