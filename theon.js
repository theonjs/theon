(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.theon = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  embed: require('./lil')
}

},{"./lil":2}],2:[function(require,module,exports){
module.exports = function (req, res, done) {
  var client = require('lil-http')
  return client(req, function (err, _res) {
    done(err, adapter(res, _res))
  })
}

function adapter(res, _res) {
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

},{"lil-http":31}],3:[function(require,module,exports){
var isBrowser = typeof window !== 'undefined'

var agents = exports.agents = isBrowser
  ? require('./browser')
  : require('./node')

exports.get = function (name) {
  return name
    ? agents[name]
    : agents.embed
}

exports.defaults = function () {
  return exports.get()
}

exports.add = function (name, agent) {
  agents[name] = agent
}

},{"./browser":1,"./node":4}],4:[function(require,module,exports){
module.exports = {
  embed: require('./request')
}

},{"./request":5}],5:[function(require,module,exports){
var utils = require('../../utils')

module.exports = function (req, res, cb) {
  var request = require('request')

  var opts = {
    url: req.url,
    qs: req.query,
    headers: req.headers,
    useQuerystring: true
  }

  // Set auth credentials, if required
  if (req.opts.auth) {
    opts.auth = req.opts.auth
  }

  // Extend agent-specific options
  utils.extend(opts, req.agentOpts)

  return request(opts, function (err, _res, body) {
    cb(err, adapter(res, _res, body))
  })
}

function adapter(res, _res, body) {
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

},{"../../utils":25,"request":30}],6:[function(require,module,exports){
var agents = require('./agents')
var Validator = require('./validator')
var Middleware = require('./middleware')
var merge = require('./utils').merge

module.exports = Context

function Context(ctx) {
  this.parent = null
  this.body = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}
  this.persistent = {}

  this.agentOpts = {}
  this.agent = agents.defaults()

  this.validator = new Validator
  this.middleware = new Middleware

  if (ctx) this.useParent(ctx)
}

Context.prototype.useParent = function (ctx) {
  this.parent = ctx
  this.setupMiddleware(ctx)
  return this
}

Context.prototype.setupMiddleware = function (parent) {
  ['middleware', 'validator'].forEach(function (key) {
    ['request', 'response'].forEach(function (phase) {
      this[key].use(phase, function (req, res, next) {
        parent[key].run(phase, req, res, next)
      })
    }, this)
  }, this)
}

Context.prototype.raw = function () {
  var parent = this.parent
    ? this.parent.raw()
    : {}

  var data = {}
  data.opts = merge(parent.opts, this.opts, this.persistent.opts)
  data.path = this.buildPath()

  data.headers = merge(parent.headers, this.headers, this.persistent.headers)
  data.query = merge(parent.query, this.query, this.persistent.query)
  data.params = merge(parent.params, this.params, this.persistent.params)
  data.cookies = merge(parent.cookies, this.cookies)

  data.agent = this.agent
  data.agentOpts = merge(parent.agentOpts, this.agentOpts, this.persistent.agentOpts)

  data.ctx = this
  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildPath = function () {
  var baseUrl = ''

  if (this.parent) {
    baseUrl += this.parent.buildPath()
  }

  var head = this.opts.basePath || ''
  var tail = this.opts.path || ''

  return baseUrl + head + tail
}

},{"./agents":3,"./middleware":17,"./utils":25,"./validator":29}],7:[function(require,module,exports){
var utils = require('./utils')
var Response = require('./response')

module.exports = Dispatcher

function Dispatcher(req) {
  this.req = req
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var req = this.req.raw()
  var res = new Response(this.req)

  var phases = [
    function before(next) {
      this.before(req, res, next)
    },
    function dial(req, res, next) {
      this.dial(req, res, next)
    },
    function after(req, res, next) {
      this.after(req, res, next)
    }
  ]

  function done(err, req, res) {
    if (err === 'intercept') err = null

    // Debug request/response, if enabled
    if (req.ctx.debug) req.ctx.debug(err, req, res)

    // Resolve the callback
    cb(err, res)
  }

  utils.series(phases, done, this)
  return this
}

Dispatcher.prototype.before = function (req, res, next) {
  this.runPhase('request', req, res, next)
}

Dispatcher.prototype.after = function (req, res, next) {
  this.runPhase('response', req, res, next)
}

Dispatcher.prototype.dial = function (req, res, next) {
  // Render URL with params
  var url = req.opts.rootUrl || ''
  var path = utils.pathParams(req.path, req.params)
  req.url = url + path

  res.orig = req.ctx.agent(req, res, function (err, res) {
    next(err, req, res)
  })
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  var phases = [
    function middleware(next) {
      this.middleware(phase, req, res, next)
    },
    function validate(res, next) {
      this.validate(phase, req, res, next)
    }
  ]

  function done(err, _res) {
    next(err, req, _res || res)
  }

  utils.series(phases, done, this)
}

Dispatcher.prototype.middleware = function (phase, req, res, next) {
  req.ctx.middleware.run(phase, req, res, function (err, _res) {
    next(err, _res || res)
  })
}

Dispatcher.prototype.validate = function (phase, req, res, next) {
  req.ctx.validator.run(phase, req, res, next)
}

function noop() {}

},{"./response":19,"./utils":25}],8:[function(require,module,exports){
var Request = require('../request')
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

Client.prototype.newRequest = function () {
  var req = new Request
  req.ctx.agent = this._client.ctx.agent
  return req
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})

},{"../dispatcher":7,"../request":18}],9:[function(require,module,exports){
var Client = require('./client')
var has = require('../utils').has

module.exports = Generator

function Generator(src) {
  this.src = src
  this.target = null
}

Generator.prototype.bind = function (target) {
  this.target = target
  return this
}

Generator.prototype.render = function () {
  var src = this.src

  this.target = this.target
    ? this.target
    : new Client(src)

  this.src.entities.forEach(this.renderEntity, this)

  return this.target
}

Generator.prototype.renderEntity = function (entity) {
  var name = entity.name
  if (!name) throw new TypeError('Render error: missing entity name')

  var value = entity.render()
  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    this.define(name, value)
  }, this)
}

Generator.prototype.define =  function (name, value) {
  if (has(this.target, name)) throw nameConflict(name)

  Object.defineProperty(this.target, name, {
    enumerable: true,
    configurable: false,
    get: function () { return value },
    set: function () { throw new Error('Cannot overwrite property: ' + name) }
  })
}

function nameConflict(name) {
  return new Error('Name conflict: "' + name + '" is already defined')
}

},{"../utils":25,"./client":8}],10:[function(require,module,exports){
module.exports = {
  Client: require('./client'),
  Generator: require('./generator')
}

},{"./client":8,"./generator":9}],11:[function(require,module,exports){
var Entity =  require('./entity')

module.exports = Client

function Client(url) {
  Entity.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Entity.prototype)

Client.prototype.entity = 'client'

},{"./entity":13}],12:[function(require,module,exports){
var Entity =  require('./entity')

module.exports = Entity.Collection = Collection

function Collection(name) {
  Entity.call(this, name)
}

Collection.prototype = Object.create(Entity.prototype)

Collection.prototype.entity = 'collection'

},{"./entity":13}],13:[function(require,module,exports){
var Request = require('../request')
var engine = require('../engine')
var Context = require('../context')

module.exports = Entity

function Entity(name) {
  this.name = name
  this.parent = null
  this.aliases = []
  this.entities = []
  this.ctx = new Context
}

Entity.prototype = Object.create(Request.prototype)

Entity.prototype.alias = function (name) {
  var aliases = this.aliases
  aliases.push.apply(aliases, arguments)
  return this
}

Entity.prototype.collection = function (collection) {
  if (!(collection instanceof Entity.Collection)) {
    collection = new Entity.Collection(collection)
  }

  return this.addEntity(collection)
}

Entity.prototype.action =
Entity.prototype.resource = function (resource) {
  if (!(resource instanceof Entity.Resource)) {
    resource = new Entity.Resource(resource)
  }

  return this.addEntity(resource)
}

Entity.prototype.mixin =
Entity.prototype.helper = function (name, mixin) {
  if (!(name instanceof Entity.Mixin)) {
    mixin = new Entity.Mixin(name, mixin)
  }

  this.addEntity(mixin)
  return this
}

Entity.prototype.addEntity = function (entity) {
  if (invalidEntity(entity)) {
    throw new TypeError('entity must implement render() method')
  }

  if (entity.useParent) {
    entity.useParent(this)
  }

  this.entities.push(entity)
  return entity
}

Entity.prototype.render = function (client) {
  return new engine.Generator(client || this).render()
}

function invalidEntity(entity) {
  return !entity || typeof entity.render !== 'function'
}

},{"../context":6,"../engine":10,"../request":18}],14:[function(require,module,exports){
module.exports = {
  Mixin: require('./mixin'),
  Entity: require('./entity'),
  Client: require('./client'),
  Resource: require('./resource'),
  Collection: require('./collection')
}

},{"./client":11,"./collection":12,"./entity":13,"./mixin":15,"./resource":16}],15:[function(require,module,exports){
var Entity =  require('./entity')

module.exports = Entity.Mixin = Mixin

function Mixin(name, fn) {
  if (typeof fn !== 'function')
    throw new TypeError('mixin must be a function')

  this.fn = fn
  this.name = name
  this.ctx = null
}

Mixin.prototype.entity = 'mixin'

Mixin.prototype.useParent = function (ctx) {
  this.ctx = ctx
}

Mixin.prototype.render = function () {
  var fn = this.fn
  var ctx = this.ctx

  return function mixin() {
    return fn.apply(ctx, arguments)
  }
}

},{"./entity":13}],16:[function(require,module,exports){
var Entity =  require('./entity')
var Request = require('../request')
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

function Resource(name) {
  Entity.call(this, name)
}

Resource.prototype = Object.create(Entity.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.render = function () {
  var ctx = this.ctx
  var req = new Request(ctx)

  new Generator(this)
    .bind(resource)
    .render()

  function resource(opts, cb) {
    if (typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }

  return resource
}

},{"../engine":10,"../request":18,"./entity":13}],17:[function(require,module,exports){
var mw = require('midware')

module.exports = Middleware

function Middleware() {
  this.stack = {}
}

Middleware.prototype.use = function (phase, fn) {
  var stack = this.stack[phase]

  if (!stack) {
    stack = this.stack[phase] = mw()
  }

  stack(fn)
  return this
}

Middleware.prototype.run = function (phase, req, res, next) {
  var stack = this.stack[phase]
  if (!stack) return next()
  this.eval(stack, req, res, next)
}

Middleware.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, next)
}

},{"midware":32}],18:[function(require,module,exports){
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

Request.prototype.persistParam = function (name, value) {
  var params = this.ctx.persistent.params || {}
  params[name] = value
  this.ctx.persistent.params = params
  return this
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
  var query = this.ctx.persistent.query || {}
  query[name] = value
  this.ctx.persistent.query = query
  return this
}

Request.prototype.persistQuery = function (query) {
  this.ctx.persistent.query = utils.extend(this.ctx.persistent.query, query)
  return this
}

Request.prototype.set =
Request.prototype.header = function (name, value) {
  this.ctx.headers[name] = value
  return this
}

Request.prototype.unset = function (name) {
  delete this.ctx.headers[name]
  return this
}

Request.prototype.headers = function (headers) {
  utils.extend(this.ctx.headers, headers)
  return this
}

Request.prototype.setHeaders = function (headers) {
  this.ctx.headers = headers
  return this
}

Request.prototype.persistHeader = function (name, value) {
  var headers = this.ctx.persistent.headers || {}
  headers[name] = value
  this.ctx.persistent.headers = headers
  return this
}

Request.prototype.persistHeaders = function (headers) {
  this.ctx.persistent.headers = utils.extend(this.ctx.persistent.headers, headers)
  return this
}

Request.prototype.type = function (value) {
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

Request.prototype.use =
Request.prototype.useRequest = function (middleware) {
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

},{"./agents":3,"./context":6,"./dispatcher":7,"./response":19,"./types":21,"./utils":25}],19:[function(require,module,exports){
module.exports = Response

function Response(req) {
  this.req = req

  this.orig =
  this.body =
  this.json =
  this.type =
  this.error = null

  this.headers = {}
  this.typeParams = {}

  this.status =
  this.statusType =
  this.statusCode = 0
  this.statusText = ''
}

Response.prototype.setOriginalResponse = function (orig) {
  this.orig = orig
}

Response.prototype.setBody = function (body) {
  this.body = body
  if (this.type === 'json') this.json = body
}

Response.prototype.get = function (name) {
  return this.headers[name.toLowerCase()]
}

Response.prototype.setHeaders = function (headers) {
  for (var key in headers) {
    this.headers[key.toLowerCase()] = headers[key]
  }

  var ct = this.headers['content-type']
  if (ct) this.setType(ct)
}

Response.prototype.setType = function (contentType) {
  // content-type
  var ct = contentType || ''
  this.type = type(ct)

  // params
  var obj = params(ct)
  for (var key in obj) this.typeParams[key] = obj[key]
}

Response.prototype.setStatus = function (status) {
  if (status === 1223) status = 204

  var type = status / 100 | 0

  this.statusType = type
  this.status = this.statusCode = status

  this.info = 1 == type
  this.ok = 2 == type
  this.clientError = 4 == type
  this.serverError = 5 == type

  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false

  // sugar
  this.accepted = 202 == status
  this.noContent = 204 == status
  this.badRequest = 400 == status
  this.unauthorized = 401 == status
  this.notAcceptable = 406 == status
  this.notFound = 404 == status
  this.forbidden = 403 == status
}

Response.prototype.setStatusText = function (text) {
  this.statusText = text
}

Response.prototype.toError = function () {
  var req = this.req
  var method = req.method
  var url = req.url

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')'
  var err = new Error(msg)
  err.status = this.status
  err.method = method
  err.url = url

  return err
}

function params(str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */)
    var key = parts.shift()
    var val = parts.shift()
    if (key && val) obj[key] = val
    return obj
  }, {})
}

function type(str) {
  return str.split(/ *; */).shift()
}

},{}],20:[function(require,module,exports){
module.exports = theon

/**
 * API factory
 */

function theon(url) {
  return new theon.entities.Client(url)
}

/**
 * Export modules
 */

theon.Request    = require('./request')
theon.Response   = require('./response')
theon.Context    = require('./context')
theon.Dispatcher = require('./dispatcher')
theon.agents     = require('./agents')
theon.engine     = require('./engine')
theon.entities   = require('./entities')
theon.utils      = require('./utils')

/**
 * Entities factory
 */

;['Client', 'Resource', 'Collection', 'Mixin'].forEach(function (name) {
  theon[name.toLowerCase()] = function (arg, arg2) {
    return new theon.entities[name](arg, arg2)
  }
})

/**
 * Current version
 */

theon.VERSION = '0.1.0'

},{"./agents":3,"./context":6,"./dispatcher":7,"./engine":10,"./entities":14,"./request":18,"./response":19,"./utils":25}],21:[function(require,module,exports){
module.exports = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
}

},{}],22:[function(require,module,exports){
module.exports = function clone(y) {
  var x = {}
  for (var k in y) x[k] = y[k]
  return x
}

},{}],23:[function(require,module,exports){
var clone = require('./clone')

module.exports = function extend(x, y) {
  x = x || {}
  for (var k in y) x[k] = y[k]
  return x
}

},{"./clone":22}],24:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty

module.exports = function (o, name) {
  return !!o && hasOwn.call(o, name)
}

},{}],25:[function(require,module,exports){
module.exports = {
  has: require('./has'),
  merge: require('./merge'),
  clone: require('./clone'),
  series: require('./series'),
  extend: require('./extend'),
  pathParams: require('./path-params')
}

},{"./clone":22,"./extend":23,"./has":24,"./merge":26,"./path-params":27,"./series":28}],26:[function(require,module,exports){
var clone = require('./clone')
var extend = require('./extend')
var slicer = Array.prototype.slice

module.exports = function merge(x, y) {
  var args = slicer.call(arguments, 1)
  x = clone(x)

  args.forEach(function (y) {
    extend(x, y)
  })

  return x
}

},{"./clone":22,"./extend":23}],27:[function(require,module,exports){
// Originally taken from pillarjs/path-to-regexp package:
// https://github.com/pillarjs/path-to-regexp
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

module.exports = function (path, params) {
  var buf = null

  while ((buf = PATH_REGEXP.exec(path)) != null) {
    var param = buf[3]
    if (param && !params[param]) {
      throw new Error('Missing path param: ' + param)
    }
    path = path.replace(':' + param, params[param])
  }

  return path
}

},{}],28:[function(require,module,exports){
var slicer = Array.prototype.slice

module.exports = function series(arr, cb, ctx) {
  var stack = arr.slice()
  cb = cb || function () {}

  function next(err) {
    if (err) return cb.apply(ctx, arguments)

    var fn = stack.shift()
    if (!fn) return cb.apply(ctx, arguments)

    var args = slicer.call(arguments, 1)
    fn.apply(ctx, args.concat(next))
  }

  next()
}

},{}],29:[function(require,module,exports){
var Middleware = require('./middleware')

module.exports = Validator

function Validator() {
  Middleware.call(this)
}

Validator.prototype = Object.create(Middleware.prototype)

Validator.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, function (err) { next(err) })
}

},{"./middleware":17}],30:[function(require,module,exports){

},{}],31:[function(require,module,exports){
/*! lil-http - v0.1.16 - MIT License - https://github.com/lil-js/http */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
    if (typeof module === 'object' && module !== null) {
      module.exports = exports = exports.http
    }
  } else {
    factory((root.lil = root.lil || {}))
  }
}(this, function (exports) {
  'use strict'

  var VERSION = '0.1.16'
  var toStr = Object.prototype.toString
  var slicer = Array.prototype.slice
  var hasOwn = Object.prototype.hasOwnProperty
  var hasBind = typeof Function.prototype.bind === 'function'
  var origin = location.origin
  var originRegex = /^(http[s]?:\/\/[a-z0-9\-\.\:]+)[\/]?/i
  var jsonMimeRegex = /application\/json/
  var hasDomainRequest = typeof XDomainRequest !== 'undefined'
  var noop = function () {}

  var defaults = {
    method: 'GET',
    timeout: 30 * 1000,
    auth: null,
    data: null,
    headers: null,
    withCredentials: false,
    responseType: 'text'
  }

  function isObj(o) {
    return o && toStr.call(o) === '[object Object]' || false
  }

  function assign(target) {
    var i, l, x, cur, args = slicer.call(arguments).slice(1)
    for (i = 0, l = args.length; i < l; i += 1) {
      cur = args[i]
      for (x in cur) if (hasOwn.call(cur, x)) target[x] = cur[x]
    }
    return target
  }

  function once(fn) {
    var called = false
    return function () {
      if (called === false) {
        called = true
        fn.apply(null, arguments)
      }
    }
  }

  function setHeaders(xhr, headers) {
    if (isObj(headers)) {
      headers['Content-Type'] = headers['Content-Type'] || http.defaultContent
      for (var field in headers) if (hasOwn.call(headers, field)) {
        xhr.setRequestHeader(field, headers[field])
      }
    }
  }

  function getHeaders(xhr) {
    var headers = {}, rawHeaders = xhr.getAllResponseHeaders().trim().split('\n')
    rawHeaders.forEach(function (header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      headers[key] = value
    })
    return headers
  }

  function isJSONResponse(xhr) {
    return jsonMimeRegex.test(xhr.getResponseHeader('Content-Type'))
  }

  function encodeParams(params) {
    return Object.getOwnPropertyNames(params).filter(function (name) {
      return params[name] !== undefined
    }).map(function (name) {
      var value = (params[name] === null) ? '' : params[name]
      return encodeURIComponent(name) + (value ? '=' + encodeURIComponent(value) : '')
    }).join('&').replace(/%20/g, '+')
  }

  function parseData(xhr) {
    var data = null
    if (xhr.responseType === 'text') {
      data = xhr.responseText
      if (isJSONResponse(xhr) && data) data = JSON.parse(data)
    } else {
      data = xhr.response
    }
    return data
  }

  function getStatus(status) {
    return status === 1223 ? 204 : status // IE9 fix
  }

  function buildResponse(xhr) {
    var response = {
      xhr: xhr,
      status: getStatus(xhr.status),
      statusText: xhr.statusText,
      data: null,
      headers: {}
    }
    if (xhr.readyState === 4) {
      response.data = parseData(xhr)
      response.headers = getHeaders(xhr)
    }
    return response
  }

  function buildErrorResponse(xhr, error) {
    var response = buildResponse(xhr)
    response.error = error
    if (error.stack) response.stack = error.stack
    return response
  }

  function cleanReferences(xhr) {
    xhr.onreadystatechange = xhr.onerror = xhr.ontimeout = null
  }

  function isValidResponseStatus(xhr) {
    var status = getStatus(xhr.status)
    return status >= 200 && status < 300 || status === 304
  }

  function onError(xhr, cb) {
    return once(function (err) {
      cb(buildErrorResponse(xhr, err), null)
    })
  }

  function onLoad(config, xhr, cb) {
    return function (ev) {
      if (xhr.readyState === 4) {
        cleanReferences(xhr)
        if (isValidResponseStatus(xhr)) {
          cb(null, buildResponse(xhr))
        } else {
          onError(xhr, cb)(ev)
        }
      }
    }
  }

  function isCrossOrigin(url) {
    var match = url.match(originRegex)
    return match && match[1] === origin
  }

  function getURL(config) {
    var url = config.url
    if (isObj(config.params)) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + encodeParams(config.params)
    }
    return url
  }

  function XHRFactory(url) {
    if (hasDomainRequest && isCrossOrigin(url)) {
      return new XDomainRequest()
    } else {
      return new XMLHttpRequest()
    }
  }

  function createClient(config) {
    var method = (config.method || 'GET').toUpperCase()
    var auth = config.auth
    var url = getURL(config)

    var xhr = XHRFactory(url)
    if (auth) {
      xhr.open(method, url, true, auth.user, auth.password)
    } else {
      xhr.open(method, url)
    }
    xhr.withCredentials = config.withCredentials
    xhr.responseType = config.responseType
    xhr.timeout = config.timeout
    setHeaders(xhr, config.headers)
    return xhr
  }

  function updateProgress(xhr, cb) {
    return function (ev) {
      if (ev.lengthComputable) {
        cb(ev, ev.loaded / ev.total)
      } else {
        cb(ev)
      }
    }
  }

  function hasContentTypeHeader(config) {
    return config && isObj(config.headers)
      && (config.headers['content-type'] || config.headers['Content-Type'])
      || false
  }

  function buildPayload(xhr, config) {
    var data = config.data
    if (isObj(config.data) || Array.isArray(config.data)) {
      if (hasContentTypeHeader(config) === false) {
        xhr.setRequestHeader('Content-Type', 'application/json')
      }
      data = JSON.stringify(config.data)
    }
    return data
  }

  function timeoutResolver(cb, timeoutId) {
    return function () {
      clearTimeout(timeoutId)
      cb.apply(null, arguments)
    }
  }

  function request(config, cb, progress) {
    var xhr = createClient(config)
    var data = buildPayload(xhr, config)
    var errorHandler = onError(xhr, cb)

    if (hasBind) {
      xhr.ontimeout = errorHandler
    } else {
      var timeoutId = setTimeout(function abort() {
        if (xhr.readyState !== 4) {
          xhr.abort()
        }
      }, config.timeout)
      cb = timeoutResolver(cb, timeoutId)
      errorHandler = onError(xhr, cb)
    }

    xhr.onreadystatechange = onLoad(config, xhr, cb)
    xhr.onerror = errorHandler
    if (typeof progress === 'function') {
      xhr.onprogress = updateProgress(xhr, progress)
    }

    try {
      xhr.send(data || null)
    } catch (e) {
      errorHandler(e)
    }

    return { xhr: xhr, config: config }
  }

  function requestFactory(method) {
    return function (url, options, cb, progress) {
      var i, l, cur = null
      var config = assign({}, defaults, { method: method })
      var args = slicer.call(arguments)

      for (i = 0, l = args.length; i < l; i += 1) {
        cur = args[i]
        if (typeof cur === 'function') {
          if (args.length === (i + 1) && typeof args[i - 1] === 'function') {
            progress = cur
          } else {
            cb = cur
          }
        } else if (isObj(cur)) {
          assign(config, cur)
        } else if (typeof cur === 'string' && !config.url) {
          config.url = cur
        }
      }

      return request(config, cb || noop, progress)
    }
  }

  function http(config, data, cb, progress) {
    return requestFactory('GET').apply(null, arguments)
  }

  http.VERSION = VERSION
  http.defaults = defaults
  http.defaultContent = 'text/plain'
  http.get = requestFactory('GET')
  http.post = requestFactory('POST')
  http.put = requestFactory('PUT')
  http.patch = requestFactory('PATCH')
  http.head = requestFactory('HEAD')
  http.delete = http.del = requestFactory('DELETE')

  return exports.http = http
}))

},{}],32:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
    if (typeof module === 'object' && module !== null) {
      module.exports = exports = exports.midware
    }
  } else {
    factory(root)
  }
}(this, function (exports) {
  'use strict'

  function midware(ctx) {
    var calls = use.stack = []
    ctx = ctx || null
       
    function use() {
      toArray(arguments)
      .filter(function (fn) {
        return typeof fn === 'function'
      })
      .forEach(function (fn) {
        calls.push(fn)
      })
      return ctx
    }

    use.run = function run() {
      var done, args = toArray(arguments)
      
      if (typeof args[args.length - 1] === 'function') {
        done = args.pop()
      }
      
      if (!calls.length) {
        if (done) done.call(ctx)
        return
      }
      
      var stack = calls.slice()
      args.push(next)
      
      function runNext() {
        var fn = stack.shift()
        fn.apply(ctx, args)
      }

      function next(err, end) {
        if (err || end || !stack.length) {
          stack = null
          if (done) done.call(ctx, err, end)
        } else {
          runNext()
        }
      }

      runNext()
    }

    use.remove = function (name) {
      for (var i = 0, l = calls.length; i < l; i += 1) {
        var fn = calls[i]
        if (fn === name || fn.name === name) {
          calls.splice(i, 1)
          break
        }
      }
    }

    use.flush = function () {
      calls.splice(0)
    }

    return use
  }

  function toArray(nargs) {
    var args = new Array(nargs.length)
    for (var i = 0, l = args.length; i < l; i += 1) {
      args[i] = nargs[i]
    }
    return args
  }
  
  midware.VERSION = '0.1.7'
  exports.midware = midware
}))

},{}]},{},[20])(20)
});