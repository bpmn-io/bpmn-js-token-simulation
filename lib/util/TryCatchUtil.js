var forEach = require('min-dash').forEach,
    isFunction = require('min-dash').isFunction;

var inherits = require('inherits');

function tryCatch(fn, functionName, callback) {
  return function() {
    try {
      return fn.apply(this, arguments);
    } catch (err) {
      if (callback) {
        callback(functionName, err);
      } else {
        console.error(getErrorMessage(functionName), err);
      }
    }
  };
}

function tryCatchAll(OriginalConstructorFunction, callback) {
  var prototype = OriginalConstructorFunction.prototype,
      functionNames = getFunctionNames(prototype);

  var OriginalConstructorFunctionName = OriginalConstructorFunction.prototype.constructor.name;

  forEach(functionNames, function(functionName) {
    if (!isFunction(prototype[functionName])) {
      return;
    }

    prototype[functionName] = tryCatch(
      prototype[functionName],
      OriginalConstructorFunctionName + '#' + functionName,
      callback
    );
  });

  function NewConstructorFunction() {
    try {
      OriginalConstructorFunction.apply(this, arguments);
    } catch (err) {
      var constructorFunctionName = OriginalConstructorFunctionName + '#constructor';

      if (callback) {
        callback(constructorFunctionName, err);
      } else {
        console.error(getErrorMessage(constructorFunctionName), err);
      }
    }
  }

  inherits(NewConstructorFunction, OriginalConstructorFunction);

  if (OriginalConstructorFunction.$inject) {
    NewConstructorFunction.$inject = OriginalConstructorFunction.$inject;
  }

  return NewConstructorFunction;
}

module.exports.tryCatchAll = tryCatchAll;

// helpers //////////

function getFunctionNames(prototype) {
  var functionNames = [];

  for (var functionName in prototype) {
    functionNames.push(functionName);
  }

  return functionNames;
}

function getErrorMessage(functionName) {
  return 'Ooops! bpmn-js-token-simulation errored at ' + functionName;
}