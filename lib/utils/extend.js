var clone = require('./clone')

module.exports = function extend(x, y) {
  for (var k in y) x[k] = y[k]
  return x
}
