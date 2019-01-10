import TokenSimulationModelerModules from 'lib/modeler';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('token-simulation - modeler', function() {

  const diagram = require('example/resources/example.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [].concat(Modeler.prototype._modules).concat([
      TokenSimulationModelerModules
    ]),
    keyboard: {
      bindTo: document
    }
  }));


  it('should toggle mode', inject(function(toggleMode) {

    // YEA!
    toggleMode.toggleMode();
  }));

});