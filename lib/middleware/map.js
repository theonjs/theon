module.exports = function map(mapper) {
  return function (req, res, next) {
    var body = res.body
    if (!body) return next()

    mapper(body, function (err, body) {
      if (err) return next(err)
      res.body = body
      next()
    })
  }
}
