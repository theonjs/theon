var utils = require('../../utils')

module.exports = function (req, res, cb) {
  var request = require('request')

  var opts = {
    url: req.url,
    qs: req.query,
    headers: req.headers,
    useQuerystring: true
  }

  // Set auth credentials, if required
  if (req.opts.auth) {
    opts.auth = req.opts.auth
  }

  // Extend agent-specific options
  utils.extend(opts, req.agentOpts)

  return request(opts, function (err, _res, body) {
    cb(err, adapter(res, _res, body))
  })
}

function adapter(res, _res, body) {
  if (!_res) return res

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
