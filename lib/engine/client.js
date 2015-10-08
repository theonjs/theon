var Dispatcher = require('../dispatcher')

module.exports = Client

function Client(client) {
  this._client = client
}

Client.prototype.doRequest = function (opts, cb) {
  opts = opts || {}
  var res = new Response(opts)
  return this._client.ctx.agent(req, res, cb)
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})
