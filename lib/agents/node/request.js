module.exports = function (req, res, cb) {
  var request = require('request')
  req.json = true

  return request(req, function (err, _res, body) {
    cb(err, adapter(res, _res, body))
  })
}

function adapter(res, _res, body) {
  // Expose the agent-specific response
  res.setOriginalResponse(_res)

  // Define recurrent HTTP fields
  res.setStatus(_res.statusCode)
  res.setStatusText(_res.statusText)
  res.setHeaders(_res.headers)

  // Define body, if present
  if (body) res.setBody(body)

  return res
}
