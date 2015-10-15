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

Request.prototype.path = function (path) {
  this.ctx.opts.path = path
  return this
}

Request.prototype.basePath = function (path) {
  this.ctx.opts.basePath = path
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
  utils.extend(this.ctx.params, params)
  return this
}

Request.prototype.persistField = function (type, name, value) {
  var persistent = this.ctx.persistent
  var types = persistent[type] || {}
  types[name] = value
  persistent[type] = types
  return this
}

Request.prototype.persistParam = function (name, value) {
  return this.persistField('params', name, value)
}

Request.prototype.persistParams = function (params) {
  this.ctx.persistent.params = utils.extend(this.ctx.persistent.params, params)
  return this
}

Request.prototype.unsetParam = function (name) {
  delete this.ctx.params[name]
  return this
}

Request.prototype.setParams = function (params) {
  this.ctx.params = params
  return this
}

Request.prototype.query = function (query) {
  utils.extend(this.ctx.query, query)
  return this
}

Request.prototype.setQuery = function (query) {
  this.ctx.query = query
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

Request.prototype.persistQueryParam = function (name, value) {
  return this.persistField('query', name, value)
}

Request.prototype.persistQuery = function (query) {
  this.ctx.persistent.query = utils.extend(this.ctx.persistent.query, query)
  return this
}

Request.prototype.set =
Request.prototype.header = function (name, value) {
  this.ctx.headers[utils.lower(name)] = value
  return this
}

Request.prototype.unset = function (name) {
  delete this.ctx.headers[utils.lower(name)]
  return this
}

Request.prototype.headers = function (headers) {
  utils.extend(this.ctx.headers, utils.normalize(headers))
  return this
}

Request.prototype.setHeaders = function (headers) {
  this.ctx.headers = utils.normalize(headers)
  return this
}

Request.prototype.persistHeader = function (name, value) {
  var headers = this.ctx.persistent.headers || {}
  headers[utils.lower(name)] = value
  this.ctx.persistent.headers = headers
  return this
}

Request.prototype.persistHeaders = function (headers) {
  this.ctx.persistent.headers = utils.extend(this.ctx.persistent.headers, headers)
  return this
}

Request.prototype.format = function (type) {
  this.ctx.opts.format = type
  return this
}

Request.prototype.type =
Request.prototype.mimeType = function (value) {
  var ctx = this.ctx
  var type = types[value] || value
  ctx.headers['content-type'] = type

  if (~type.indexOf('json')) {
    ctx.agentOpts.json = true
  }

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

Request.prototype.map = function (fn) {
  this.ctx.middleware.use('after response', middleware)

  function middleware(req, res, next) {
    var body = res.body
    if (!body) return next()

    fn(body, function (err, body) {
      if (err) return next(err)
      if (body) res.body = body
      next()
    })
  }

  return this
}

Request.prototype.use =
Request.prototype.useRequest = function (middleware) {
  this.ctx.middleware.use('commit request', middleware)
  return this
}

Request.prototype.useResponse = function (middleware) {
  this.ctx.middleware.use('commit response', middleware)
  return this
}

Request.prototype.validator =
Request.prototype.requestValidator = function (middleware) {
  this.ctx.middleware.use('validator request', middleware)
  return this
}

Request.prototype.responseValidator = function (middleware) {
  this.ctx.middleware.use('validator response', middleware)
  return this
}

Request.prototype.validate = function (cb) {
  var req = this.raw()
  var res = new Response(this.req)

  new Dispatcher(this)
    .runStack('validator', 'request', req, res, cb)

  return this
}

Request.prototype.observe = function (phase, hook) {
  this.ctx.middleware.use(phase, hook)
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
  utils.extend(this.ctx.agentOpts, opts)
  return this
}

Request.prototype.setAgentOpts = function (opts) {
  this.ctx.agentOpts = opts
  return this
}

Request.prototype.persistAgentOpts = function (opts) {
  this.ctx.persistent.agentOpts = opts
  return this
}

Request.prototype.options = function (opts) {
  utils.extend(this.ctx.opts, opts)
  return this
}

Request.prototype.persistOptions = function (opts) {
  this.ctx.persistent.opts = opts
  return this
}

Request.prototype.useParent = function (parent) {
  if (!(parent instanceof Request))
    throw new TypeError('Parent context is not a valid argument')

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

Request.prototype.end =
Request.prototype.done = function (cb) {
  var dispatcher = new Dispatcher(this)
  return typeof cb === 'function'
    ? dispatcher.run(cb)
    : dispatcher
}

Request.prototype.raw = function () {
  var opts = this.ctx.raw()
  opts.client = this
  return opts
}

Request.prototype.clone = function () {
  var ctx = this.ctx.clone()
  var req = new Request(ctx)
  req.parent = this.parent
  return req
}
