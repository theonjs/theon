var clone = require('./clone')

module.exports = function merge(x, y) {
  x = clone(x || {})
  for (var k in y) x[k] = y[k]
  return x
}
