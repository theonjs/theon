module.exports = function (req, res, done) {
  var client = require('lil-http')

  var opts = {
    url: req.url,
    method: req.method,
    auth: req.opts.auth,
    params: req.query,
    headers: req.headers,
    timeout: +req.opts.timeout || +req.agentOpts.timeout,
    withCredentials: req.agentOpts.withCredentials,
    data: req.body
  }

  return client(opts, function (err, _res) {
    done(err, adapter(res, err || _res))
  })
}

function adapter (res, _res) {
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
