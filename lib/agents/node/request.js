module.exports = function (opts, ctx, cb) {
  var request = require('request')
  opts.json = true

  return request(opts, function (err, res, body) {
    if (err) return cb(err, res)
    if (body) res.body = body
    cb(err, res)
  })
}
