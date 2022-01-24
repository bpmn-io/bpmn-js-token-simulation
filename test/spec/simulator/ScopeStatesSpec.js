import { ScopeStates } from 'lib/simulator/ScopeStates';
import { ScopeTraits } from 'lib/simulator/ScopeTraits';


describe('simulator - ScopeStates', function() {

  it('should complete normally', function() {

    // assume
    ScopeStates.ACTIVATED.start().complete().destroy();
  });


  it('should fail', function() {

    // assume
    ScopeStates.ACTIVATED.start().fail().destroy();
  });


  it('should become compensable', function() {

    // given
    const running = ScopeStates.ACTIVATED.start();

    // when
    const compensableCompleted = running.compensable().complete().destroy();
    const compensableCanceled = compensableCompleted.cancel().destroy();

    // then
    expect(compensableCompleted.hasTrait(ScopeTraits.DESTROYED)).to.be.false;
    expect(compensableCanceled.hasTrait(ScopeTraits.DESTROYED)).to.be.true;
  });

});