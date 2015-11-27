module.exports = function extend (x, y) {
  x = x || {}
  for (var k in y) x[k] = y[k]
  return x
}
