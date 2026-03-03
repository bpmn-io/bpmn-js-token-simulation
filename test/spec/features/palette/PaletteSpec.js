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


describe('features/palette', function() {

  beforeEach(bootstrapModeler(diagram, {
    additionalModules: [
      ModelerModule,
      TestModule
    ]
  }));


  it('should place palette before the SVG in DOM', inject(function(canvas) {

    // when
    const container = canvas.getContainer();
    const palette = domQuery('.bts-palette', container);
    const svg = domQuery('svg', container);

    // then
    expect(palette).to.exist;
    expect(svg).to.exist;

    const children = Array.from(container.querySelectorAll(':scope > *'));
    const paletteIdx = children.findIndex(el => el.classList.contains('bts-palette'));
    const svgIdx = children.findIndex(el => el.tagName.toLowerCase() === 'svg');

    expect(paletteIdx).to.be.greaterThan(-1);
    expect(svgIdx).to.be.greaterThan(-1);
    expect(paletteIdx).to.be.lessThan(svgIdx);
  }));


  it('should order toggle before palette in DOM', inject(function(canvas) {

    // when
    const container = canvas.getContainer();
    const children = Array.from(container.querySelectorAll(':scope > *'));
    const toggleIdx = children.findIndex(el => el.classList.contains('bts-toggle-mode'));
    const paletteIdx = children.findIndex(el => el.classList.contains('bts-palette'));

    // then
    expect(toggleIdx).to.be.greaterThan(-1);
    expect(paletteIdx).to.be.greaterThan(-1);
    expect(toggleIdx).to.be.lessThan(paletteIdx);
  }));

});
