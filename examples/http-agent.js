const theon = require('..')
const request = require('request')

function requestAdapter (req, res, cb) {
  const opts = {
    url: req.url,
    qs: req.query,
    body: req.body,
    headers: req.headers,
    method: req.method,
    useQuerystring: true
  }

  // Set JSON format
  opts.json = req.opts.format === 'json'

  // Set auth credentials, if required
  if (req.opts.auth) {
    opts.auth = req.opts.auth
  }

  // Extend agent-specific options
  Object.assign(opts, req.agentOpts)

  // If stream passed, pipe it!
  // Note: not all the HTTP clients has to support stream
  // in that case, you can resolve with an error or throw something
  return req.stream
    ? req.stream.pipe(request(opts, handler))
    : request(opts, handler)

  function handler (err, _res, body) {
    cb(err, adapter(res, _res, body))
  }
}

// We map fields to theon.Response interface for full compatibility
function adapter (res, _res, body) {
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

// Important: tell theon to use the HTTP adapter
theon.agents.set(requestAdapter)
