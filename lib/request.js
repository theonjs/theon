var types = require('./types')
var utils = require('./utils')
var agents = require('./agents')
var Context = require('./context')
var Response = require('./response')
var Dispatcher = require('./dispatcher')

module.exports = Request

function Request(ctx) {
  this.parent = null
  this.ctx = new Context(ctx)
}

Request.prototype.url = function (url) {
  this.ctx.opts.rootUrl = url
  return this
}

Request.prototype.basePath = function (path) {
  this.ctx.opts.basePath = path
  return this
}

Request.prototype.path = function (path) {
  this.ctx.opts.path = path
  return this
}

Request.prototype.method = function (name) {
  this.ctx.opts.method = name
  return this
}

Request.prototype.param = function (name, value) {
  this.ctx.params[name] = value
  return this
}

Request.prototype.params = function (params) {
  utils.merge(this.ctx.params, params)
  return this
}

Request.prototype.unsetParam = function (name) {
  delete this.ctx.params[name]
  return this
}

Request.prototype.query = function (query) {
  utils.merge(this.ctx.query, query)
  return this
}

Request.prototype.queryParam = function (name, value) {
  this.ctx.query[name] = value
  return this
}

Request.prototype.unsetQuery = function (name) {
  delete this.ctx.query[name]
  return this
}

Request.prototype.set = function (name, value) {
  this.ctx.headers[name] = value
  return this
}

Request.prototype.unset = function (name) {
  delete this.ctx.headers[name]
  return this
}

Request.prototype.headers = function (headers) {
  utils.merge(this.ctx.headers, headers)
  return this
}

Request.prototype.type = function (value) {
  this.ctx.headers['content-type'] = types[value] || value
  return this
}

Request.prototype.send =
Request.prototype.body = function (body) {
  this.ctx.body = body
  return this
}

Request.prototype.cookie = function (name, value) {
  this.ctx.cookies[name] = value
  return this
}

Request.prototype.unsetCookie = function (name) {
  delete this.ctx.cookies[name]
  return this
}

Request.prototype.auth = function (user, password) {
  this.ctx.opts.auth = { user: user, password: password }
  return this
}

/**
 * Attach a new middleware in the incoming phase
 * @param {Function} middleware
 * @return {this}
 */

Request.prototype.use = function (middleware) {
  this.ctx.middleware.use('request', middleware)
  return this
}

Request.prototype.useResponse = function (middleware) {
  this.ctx.middleware.use('response', middleware)
  return this
}

Request.prototype.validator =
Request.prototype.requestValidator = function (middleware) {
  this.ctx.validator.use('request', middleware)
  return this
}

Request.prototype.responseValidator = function (middleware) {
  this.ctx.validator.use('response', middleware)
  return this
}

Request.prototype.validate = function (cb) {
  var req = this.raw()
  var res = new Response(this.req)

  new Dispatcher(this)
    .validate('request', req, res, cb)

  return this
}

Request.prototype.model = function (model) {
  if (typeof model !== 'function')
    throw new TypeError('model must be a function')

  this.useResponse(function (req, res, next) {
    var body = res.body
    if (body) res.model = model(body, req, res)
    next()
  })

  return this
}

Request.prototype.agent = function (agent) {
  if (typeof agent === 'string')
    agent = agents.get(agent)

  if (typeof agent !== 'function')
    throw new TypeError('unsupported or invalid agent')

  this.ctx.agent = agent
  return this
}

Request.prototype.agentOpts = function (opts) {
  this.ctx.agentOpts = opts
  return this
}

Request.prototype.options = function (opts) {
  utils.merge(this.ctx.opts, opts)
  return this
}

Request.prototype.debug = function (debug) {
  if (typeof debug !== 'function')
    throw new TypeError('debug must be a function')

  this.ctx.debug = debug
  return this
}

Request.prototype.stopDebugging = function () {
  this.ctx.debug = null
  return this
}

Request.prototype.useParent = function (parent) {
  if (!(parent instanceof Request))
    throw new TypeError('Parent context is not a valid argument')

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

Request.prototype.end = function (cb) {
  return new Dispatcher(this).run(cb)
}

Request.prototype.raw = function () {
  var opts = this.ctx.raw()
  opts.req = this
  opts.ctx = this.ctx
  return opts
}

Request.prototype.clone = function () {
  var ctx = this.ctx.clone()
  var req = new Request(ctx)
  req.parent = this.parent
  return req
}
