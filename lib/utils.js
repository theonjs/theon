var slicer = Array.prototype.slice

exports.merge = function (x, y) {
  x = x || {}
  for (var k in y) {
    x[k] = y[k]
  }
  return x
}

exports.series = function (arr, cb, ctx) {
  var stack = arr.slice()
  cb = cb || function () {}

  function next(err) {
    if (err) return cb.apply(ctx, arguments)

    var fn = stack.shift()
    if (!fn) return cb.apply(ctx, arguments)

    var args = slicer.call(arguments, 1)
    fn.apply(ctx, args.concat(next))
  }

  next()
}
