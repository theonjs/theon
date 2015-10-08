module.exports = function (req, res, cb) {
  var request = require('request')
  var opts = req.opts
  opts.json = true

  return request(opts, function (err, res, body) {
    if (err) return cb(err, res)
    if (body) res.body = body
    cb(err, res)
  })
}
