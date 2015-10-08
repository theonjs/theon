var Dispatcher = require('../dispatcher')

module.exports = Client

function Client(client) {
  this._client = client
}

Client.prototype.doRequest = function (req, cb) {
  var opts = args[0] || {}
  if (opts) opts.method = method

  var res = new Response(opts)
  this._client.ctx.agent(req, res, function (err, res) {
    next(err, req, res)
  })
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})
