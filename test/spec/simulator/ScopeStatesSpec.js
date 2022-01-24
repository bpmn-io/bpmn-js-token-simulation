import { ScopeStates } from 'lib/simulator/ScopeStates';


describe('simulator - ScopeStates', function() {

  it('should complete normally', function() {

    // assume
    ScopeStates.ACTIVATED.start().complete().destroy();
  });


  it('should fail', function() {

    // assume
    ScopeStates.ACTIVATED.start().fail().destroy();
  });

});