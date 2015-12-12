var Base = require('../base')
var types = require('../types')
var utils = require('../utils')
var Dispatcher = require('../dispatcher')
var hasPromise = typeof Promise === 'function'

module.exports = Request

function Request (ctx) {
  Base.call(this, ctx)
  this.pipes = []
  this.parent = null
  this.dispatcher = null
  defineAccessors(this)
}

Request.prototype = Object.create(Base.prototype)

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

Request.prototype.params = function (params, value) {
  if (params && value) return this.param(params, value)
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

Request.prototype.persistParams = function (params, value) {
  if (params && value) return this.persistParam(params, value)
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

Request.prototype.query = function (query, value) {
  if (query && value) return this.queryParam(query, value)
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

Request.prototype.persistQuery =
Request.prototype.persistQueryParams = function (query, value) {
  if (query && value) return this.persistentQueryParam(query, value)
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

Request.prototype.headers = function (headers, value) {
  if (headers && value) return this.set(headers, value)
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

Request.prototype.persistHeaders = function (headers, value) {
  if (headers && value) return this.persistHeader(headers, value)
  utils.extend(this.ctx.persistent.headers, headers)
  return this
}

Request.prototype.format = function (type) {
  this.ctx.opts.format = type
  return this
}

Request.prototype.type =
Request.prototype.mimeType = function (value, header) {
  var ctx = this.ctx
  var type = types[value] || value

  if (~type.indexOf('json')) {
    ctx.agentOpts.json = true
  }

  ctx.headers[header || 'content-type'] = type
  return this
}

Request.prototype.accept = function (type) {
  return this.type(type, 'accept')
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

Request.prototype.options = function (opts) {
  utils.extend(this.ctx.opts, opts)
  return this
}

Request.prototype.persistOptions = function (opts) {
  this.ctx.persistent.opts = opts
  return this
}

Request.prototype.useParent = function (parent) {
  if (!(parent instanceof Request)) {
    throw new TypeError('Parent context is not a valid')
  }

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

Request.prototype.dispatch = function (cb) {
  // If already dispatched, just ignore it
  if (this.dispatcher) return this

  var dispatcher = this.dispatcher = new Dispatcher(this)

  // Push task into the event loop to force asynchronicity
  setTimeout(function () { dispatcher.run(cb) }, 0)

  return this
}

Request.prototype.handle =
Request.prototype.response = function (fn) {
  this.useResponse(function (req, res, next) {
    fn(res, req)
    next()
  })
  return this
}

Request.prototype.end =
Request.prototype.done = function (cb) {
  return this.dispatch(cb)
}

Request.prototype.then = function (success, error) {
  if (!hasPromise) throwPromiseError()
  if (this.promise) return this.promise.then(success, error)

  var self = this
  this.promise = new Promise(function (resolve, reject) {
    self.end(function (err, res) {
      if (err || res.error) reject(err || res)
      else resolve(res)
    })
  })

  return this.promise.then(success, error)
}

Request.prototype.catch = function (error) {
  if (!hasPromise) throwPromiseError()
  if (this.promise) return this.promise.catch(error)
  return this.then(noop, error)
}

Request.prototype.pipe = function (stream) {
  this.pipes.push(stream)
  return this
}

Request.prototype.stream =
Request.prototype.bodyStream = function (stream) {
  if (!stream || typeof stream.pipe !== 'function') {
    throw new TypeError('Invalid stream interface')
  }

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
  var req = new Request()
  req.useParent(ctx || this)
  return req
}

/**
 * Request getter accessors
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

Request.accessors.api = function () {
  return this.parent
    ? this.parent.api
    : this.publicClient
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

function defineAccessors (ctx) {
  Object.keys(Request.accessors).forEach(function (key) {
    Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: false,
      get: Request.accessors[key],
      set: function () { throw new Error('Cannot overwrite property') }
    })
  })
}

function throwPromiseError () {
  throw new Error('Native promises are not supported. Use callback instead via: .end(cb)')
}

function noop () {}
