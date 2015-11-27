var Request = require('../request')
var Response = require('../response')

module.exports = Client

function Client (client) {
  this._client = client
}

Client.prototype.doRequest = function (ctx, cb) {
  ctx = ctx || {}
  var res = new Response(ctx)
  return this._client.ctx.agent(ctx, res, cb)
}

Client.prototype.newRequest = function (client) {
  var req = new Request()
  req.useParent(client || this._client)
  return req
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})
