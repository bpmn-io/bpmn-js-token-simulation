import ModelerModule from 'lib/modeler';

import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';


const TestModule = {
  __depends__: [
    SimulationSupportModule
  ]
};


describe('features/gateway-settings', function() {

  const diagramXML = require('./gateways.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));


  it('should not change xml when toggling simulation off', inject(
    async function(toggleMode, bpmnjs) {

      // given
      const { xml: originalXML } = await bpmnjs.saveXML({ format: true });

      // when
      // simulation is toggled <ON> and <OFF>
      toggleMode.toggleMode();
      toggleMode.toggleMode();

      // then
      const { xml: savedXML } = await bpmnjs.saveXML({ format: true });

      expect(savedXML).to.eql(originalXML);

    }
  ));

});

