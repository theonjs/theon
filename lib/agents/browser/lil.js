module.exports = function (req, res, done) {
  var client = require('lil-http')
  return client(req, function (err, _res) {
    done(err, responseAdapter(res, _res))
  })
}

function responseAdapter(res, _res) {
  // Expose the agent-specific response
  res.setOriginalResponse(_res)

  // Define recurrent HTTP fields
  res.setStatus(_res.status)
  res.setStatusText(_res.statusText)
  res.setHeaders(_res.headers)

  // Define body, if present
  if (_res.data) res.setBody(_res.data)

  return res
}
