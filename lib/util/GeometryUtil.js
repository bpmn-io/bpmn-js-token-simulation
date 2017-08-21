module.exports.getMid = function(element) {
  var bbox = element.bbox();

  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  };
}

module.exports.distance = function(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}