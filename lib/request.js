var types = require('./types')
var utils = require('./utils')
var agents = require('./agents')
var Context = require('./context')
var Response = require('./response')
var Dispatcher = require('./dispatcher')
var middleware = require('./middleware')

module.exports = Request

function Request(ctx) {
  this.pipes = []
  this.parent = null
  this.dispatcher = null
  this.ctx = new Context(ctx)
  defineAccessors(this)
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
  this.ctx.method = name
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
  utils.extend(this.ctx.persistent.params, params)
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
  utils.extend(this.ctx.persistent.query, query)
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
  utils.extend(this.ctx.persistent.headers, utils.normalize(headers))
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
  utils.extend(this.ctx.persistent.headers, headers)
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

  if (~type.indexOf('json')) {
    ctx.agentOpts.json = true
  }

  ctx.headers['content-type'] = type
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

Request.prototype.map =
Request.prototype.bodyMap = function (mapper) {
  this.ctx.middleware.use('after response', middleware.map(mapper))
  return this
}

Request.prototype.use =
Request.prototype.useRequest = function (middleware) {
  this.ctx.middleware.use('middleware request', middleware)
  return this
}

Request.prototype.useEntity =
Request.prototype.useEntityRequest = function (middleware) {
  var phase = 'middleware request ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

Request.prototype.useResponse = function (middleware) {
  this.ctx.middleware.use('middleware response', middleware)
  return this
}

Request.prototype.useEntityResponse = function (middleware) {
  var phase = 'middleware response ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

Request.prototype.validator =
Request.prototype.requestValidator = function (middleware) {
  this.ctx.middleware.use('validator request', middleware)
  return this
}

Request.prototype.entityValidator =
Request.prototype.entityRequestValidator = function (middleware) {
  var phase = 'validator request ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

Request.prototype.responseValidator = function (middleware) {
  this.ctx.middleware.use('validator response', middleware)
  return this
}

Request.prototype.entityResponseValidator = function (middleware) {
  var phase = 'validator response ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

Request.prototype.interceptor = function (interceptor) {
  this.ctx.middleware.use('before dial', interceptor)
  return this
}

Request.prototype.entityInterceptor = function (interceptor) {
  this.ctx.middleware.use('before dial ' + this.entityHierarchy, interceptor)
  return this
}

Request.prototype.evaluator = function (evaluator) {
  this.ctx.middleware.use('before response', evaluator)
  return this
}

Request.prototype.entityEvaluator = function (evaluator) {
  this.ctx.middleware.use('before response' + this.entityHierarchy, evaluator)
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

Request.prototype.observeEntity = function (phase, hook) {
  this.ctx.middleware.use(phase + ' ' + this.entityHierarchy, hook)
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
    throw new TypeError('Parent context is not a valid')

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

Request.prototype.dispatch = function (cb) {
  // If already dispatched, just ignore it
  if (this.dispatcher) return this

  var dispatcher = this.dispatcher = new Dispatcher(this)

  // Push into the event loop to force asynchronicity
  setTimeout(function () { dispatcher.run(cb) }, 0)

  return this
}

Request.prototype.end =
Request.prototype.done = function (cb) {
  return this.dispatch(cb)
}

Request.prototype.pipe = function (stream) {
  this.pipes.push(stream)
  return this
}

Request.prototype.stream =
Request.prototype.bodyStream = function (stream) {
  if (!stream || typeof stream.pipe !== 'function')
    throw new TypeError('Invalid stream interface')

  this.ctx.stream = stream
  return this
}

Request.prototype.raw = function () {
  var raw = this.ctx.raw()
  raw.client = this
  raw.root = this.root
  return raw
}

Request.prototype.clone = function () {
  var ctx = this.ctx.clone()
  var req = new Request(ctx)
  req.parent = this.parent
  return req
}

Request.prototype.newRequest = function (ctx) {
  var req = new Request
  req.useParent(ctx || this)
  return req
}

/**
 * Instance property getter accessors
 */

Request.accessors = Object.create(null)

Request.accessors.store = function () {
  return this.ctx.store
}

Request.accessors.root = function () {
  return this.parent
    ? this.parent.root
    : this
}

Request.accessors.entityHierarchy = function () {
  var name = ''

  if (this.parent) {
    var parent = this.parent.entityHierarchy
    name = parent ? parent + ' ' : name
  }

  if (this.entity) {
    name += this.entity + ' ' + (this.name || '*')
  }

  return name
}

function defineAccessors(ctx) {
  Object.keys(Request.accessors).forEach(function (key) {
    Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: false,
      get: Request.accessors[key],
      set: function () {}
    })
  })
}
