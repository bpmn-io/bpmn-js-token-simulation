/* global sinon */

var tryCatchAll = require('lib/util/TryCatchUtil').tryCatchAll;

var spy = sinon.spy;

describe('tryCatchAll', function() {

  it('should catch constructor error', function() {

    // given
    function Foo() {
      throw new Error();
    }

    var NewConstructorFunction = tryCatchAll(Foo, function(functionName, err) {

      // then
      expect(functionName).to.equal('Foo#constructor');
      expect(err).to.exist;
    });

    // when
    new NewConstructorFunction();
  });


  it('should catch method error', function() {

    // given
    function Foo() {}

    Foo.prototype.foo = function() {
      throw new Error();
    };

    var NewConstructorFunction = tryCatchAll(Foo, function(functionName, err) {

      // then
      expect(functionName).to.equal('Foo#foo');
      expect(err).to.exist;
    });

    var foo = new NewConstructorFunction();

    // when
    foo.foo();
  });


  it('should catch all errors', function() {

    // given
    var catchSpy = spy();

    function Foo() {
      throw new Error();
    }

    Foo.prototype.foo = function() {
      throw new Error();
    };

    function Bar(foo) {
      foo.foo();

      throw new Error();
    }

    var NewFooConstructorFunction = tryCatchAll(Foo, catchSpy),
        NewBarConstructorFunction = tryCatchAll(Bar, catchSpy);

    // when
    var foo = new NewFooConstructorFunction();

    new NewBarConstructorFunction(foo);

    // then
    expect(catchSpy).to.have.been.calledThrice;
  });

});