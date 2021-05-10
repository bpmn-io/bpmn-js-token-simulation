import TokenSimulationModelerModules from 'lib/modeler';
import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('token-simulation - modeler', function() {

  const diagram = require('./simple.bpmn');

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ...Modeler.prototype._modules,
      TokenSimulationModelerModules
    ]
  }));


  it('should toggle mode', inject(function(toggleMode) {

    // YEA!
    toggleMode.toggleMode();

    // and do it again!
    toggleMode.toggleMode();
  }));

});