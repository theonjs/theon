var Request = require('../request')
var Response = require('../response')

module.exports = Client

function Client (client) {
  this._client = client
  this._client.api = this
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

// Delegate API methods to client entity methods
var methods = [
  'plugin',
  'usePlugin',
  'getPlugin',
  'use',
  'useRequest',
  'useEntity',
  'useResponse',
  'useEntityResponse',
  'observe',
  'observeEntity',
  'before',
  'after',
  'validator',
  'requestValidator',
  'entityValidator',
  'entityRequestValidator',
  'responseValidator',
  'entityResponseValidator',
  'interceptor',
  'entityInterceptor',
  'evaluator',
  'entityEvaluator',
  'validate',
  'agent',
  'agentOpts',
  'persistAgentOpts',
  'options',
  'persistOptions'
]

methods.forEach(function (method) {
  Client.prototype[method] = function () {
    var ctx = this._client[method].apply(this._client, arguments)
    return (ctx instanceof this._client)
      ? this
      : ctx
  }
})

// Deletegate HTTP verbs as API sugar
var verbs = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'TRACE',
  'OPTIONS'
]

verbs.forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})
