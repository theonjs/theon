module.exports = function clone (y) {
  var x = {}
  if (Object(y) !== y) return x
  for (var k in y) x[k] = y[k]
  return x
}
