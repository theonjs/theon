module.exports = function (req, res, cb) {
  var request = require('request')
  req.json = true

  return request(req, function (err, res, body) {
    if (err) return cb(err, res)
    if (body) res.body = body
    cb(err, res)
  })
}
