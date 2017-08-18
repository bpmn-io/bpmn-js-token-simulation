'use strict';

module.exports.is = function(element, types) {

  if (element.type === 'label') {
    return;
  }

  if (!Array.isArray(types)) {
    types = [ types ];
  }

  var isType = false;

  types.forEach(function(type) {
    var bo = element.businessObject;

    if (bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)) {
      isType = true;
    }
  });

  return isType;
};