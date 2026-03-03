import ModelerModule from 'lib/modeler';
import SimulationSupportModule from 'lib/simulation-support';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';

import {
  query as domQuery
} from 'min-dom';


const TestModule = {
  __depends__: [ SimulationSupportModule ]
};

const diagram = require('../context-pads/ContextPads.scope-filter.bpmn');


describe('features/toggle-mode', function() {

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));


  it('should render toggle as a <button> element', inject(function(canvas) {

    // when
    const toggle = domQuery('.bts-toggle-mode', canvas.getContainer());

    // then
    expect(toggle).to.exist;
    expect(toggle.tagName.toLowerCase()).to.equal('button');
  }));


  it('should place toggle before the SVG container in DOM', inject(function(canvas) {

    // when
    const container = canvas.getContainer();
    const toggle = domQuery('.bts-toggle-mode', container);
    const svg = domQuery('svg', container);

    // then
    expect(toggle).to.exist;
    expect(svg).to.exist;

    const children = Array.from(container.querySelectorAll(':scope > *'));
    const toggleIdx = children.findIndex(el => el.classList.contains('bts-toggle-mode'));
    const svgIdx = children.findIndex(el => el.tagName.toLowerCase() === 'svg');

    expect(toggleIdx).to.be.greaterThan(-1);
    expect(svgIdx).to.be.greaterThan(-1);
    expect(toggleIdx).to.be.lessThan(svgIdx);
  }));


  it('should toggle simulation on click', inject(function(canvas, toggleMode) {

    // given
    const toggle = domQuery('.bts-toggle-mode', canvas.getContainer());

    // when
    toggle.click();

    // then
    expect(toggleMode._active).to.be.true;

    // and when
    toggle.click();

    // then
    expect(toggleMode._active).to.be.false;
  }));

});
