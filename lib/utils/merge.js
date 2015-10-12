var clone = require('./clone')
var extend = require('./extend')
var slicer = Array.prototype.slice

module.exports = function merge(x, y) {
  var args = slicer.call(arguments, 1)
  x = clone(x)

  args.forEach(function (y) {
    extend(x, y)
  })

  return x
}
