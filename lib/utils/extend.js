module.exports = function extend (x, y) {
  x = x || {}
  if (Object(y) !== y) return x
  for (var k in y) x[k] = y[k]
  return x
}
