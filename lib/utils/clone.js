module.exports = function clone (y) {
  var x = {}
  for (var k in y) x[k] = y[k]
  return x
}
