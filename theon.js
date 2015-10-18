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

},{"lil-http":35}],3:[function(require,module,exports){
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

exports.set = function (agent) {
  exports.add('embed', agent)
}

exports.add = function (name, agent) {
  if (typeof name !== 'string')
    throw new TypeError('first argument must be a string')
  if (typeof agent !== 'function')
    throw new TypeError('agent must be a function')

  agents[name] = agent
}

exports.remove = function (name) {
  delete agents[name]
}

},{"./browser":1,"./node":4}],4:[function(require,module,exports){
module.exports = {
  embed: require('./request')
}

},{"./request":5}],5:[function(require,module,exports){
var request = require('request')
var utils = require('../../utils')

module.exports = function (req, res, cb) {
  var opts = {
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
  utils.extend(opts, req.agentOpts)

  // If stream passed, pipe it!
  return req.stream
    ? req.stream.pipe(request(opts, handler))
    : request(opts, handler)

  function handler(err, _res, body) {
    cb(err, adapter(res, _res, body))
  }
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

},{"../../utils":27,"request":34}],6:[function(require,module,exports){
var Middleware = require('midware-pool')
var agents = require('./agents')
var Store = require('./store')
var utils = require('./utils')

module.exports = Context

function Context(ctx) {
  this.body =
  this.stream =
  this.method =
  this.parent = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}
  this.persistent = {}

  this.agentOpts = {}
  this.agent = agents.defaults()

  this.store = new Store
  this.middleware = new Middleware

  if (ctx) this.useParent(ctx)
}

Context.fields = [
  'opts',
  'headers',
  'query',
  'params',
  'cookies',
  'agentOpts'
]

Context.prototype.useParent = function (parent) {
  this.parent = parent

  ;['middleware', 'store'].forEach(function (key) {
    this[key].useParent(parent[key])
  }, this)

  return this
}

Context.prototype.raw = function () {
  var data = this.mergeParams()
  data.agent = this.agent

  // Expose needed members
  data.ctx = this
  data.store = this.store

  // Set defaults
  if (!data.method) data.method = 'GET'

  return data
}

Context.prototype.mergeParams = function () {
  var data = {}
  var parent = this.parent ? this.parent.raw() : {}

  ;['method', 'body', 'stream'].forEach(function (name) {
    data[name] = this[name] || parent[name] || null
  }, this)

  Context.fields.forEach(function (name) {
    var merger = name === 'headers' ? mergeHeaders : utils.merge
    data[name] = merger(parent[name], this[name], this.persistent[name])
  }, this)

  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildPath = function () {
  return Context.buildPath(this)
}

Context.buildPath = function buildPath(ctx) {
  var base = ''

  if (ctx.parent) {
    base += buildPath(ctx.parent)
  }

  var opts = ctx.opts
  var head = opts.basePath || ''
  var tail = opts.path || ''

  return base + head + tail
}

function mergeHeaders() {
  return utils.normalize(utils.merge.apply(null, arguments))
}

},{"./agents":3,"./store":21,"./utils":27,"midware-pool":36}],7:[function(require,module,exports){
var utils = require('./utils')
var Response = require('./response')

module.exports = Dispatcher

function Dispatcher(req) {
  this.req = req
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var ctx = this.req.ctx
  var req = this.req.raw()
  var res = new Response(req)

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
    var client = this.req

    if (err === 'intercept') err = null

    // Set request context, if not present
    if (!res.req) res.req = req

    // Resolve the callback
    if (!err) return cb(null, res, client)

    // Expose the error
    req.error = err

    // Dispatch the error hook
    ctx.middleware.run('error', req, res, function (_err, _res) {
      cb(_err || err, _res || res, client)
    })
  }

  utils.series(phases, done, this)

  return this.req
}

Dispatcher.prototype.before = function (req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before', req, res, next)
    },
    function request(req, res, next) {
      this.runPhase('request', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.after = function (req, res, next) {
  utils.series([
    function response(next) {
      this.runPhase('response', req, res, next)
    },
    function after(req, res, next) {
      this.runHook('after', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.dial = function (req, res, next) {
  var url = req.opts.rootUrl || ''
  var path = req.ctx.buildPath()
  var fullPath = utils.pathParams(path, req.params)

  if (fullPath instanceof Error) {
    return next(fullPath)
  }

  // Compose the full URL
  req.url = url + fullPath

  utils.series([
    function before(next) {
      req.ctx.middleware.run('before dial', req, res, forward(req, res, next))
    },
    this.dialer,
    function after(req, res, next) {
      req.ctx.middleware.run('after dial', req, res, forward(req, res, next))
    }
  ], next, this)
}

Dispatcher.prototype.dialer = function (req, res, next) {
  var nextFn = utils.once(forward(req, res, next))

  // Call the HTTP agent adapter
  res.orig = req.ctx.agent(req, res, nextFn)

  // Handle writable stream pipes
  if (res.orig && res.orig.pipe) {
    this.req.pipes.forEach(function (stream) {
      res.orig.pipe(stream)
    })
  }

  // Dispatch the dialing observer
  req.ctx.middleware.run('dialing', req, res, function (err) {
    if (!err) return

    if (res.orig && typeof res.orig.abort === 'function') {
      nextFn(new Error('Request cancelled: ' + (err.message || err)))
      res.orig.abort()
    }
  })
}

Dispatcher.prototype.runHook = function (event, req, res, next) {
  req.ctx.middleware.run(event, req, res, forward(req, res, next))
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before ' + phase, req, res, next)
    },
    function middleware(req, res, next) {
      this.runStack('middleware', phase, req, res, next)
    },
    function validate(req, res, next) {
      this.runStack('validator', phase, req, res, next)
    },
    function after(req, res, next) {
      this.runHook('after ' + phase, req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.runStack = function (stack, phase, req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before ' + stack + ' ' + phase, req, res, next)
    },
    function run(req, res, next) {
      req.ctx.middleware.run(stack + ' ' + phase, req, res, forward(req, res, next))
    },
    function after(req, res, next) {
      this.runHook('after ' + stack + ' ' + phase, req, res, next)
    },
  ], next, this)
}

function forward(req, res, next) {
  return function (err, _res) {
    next(err, req, _res || res)
  }
}

function noop() {}

},{"./response":20,"./utils":27}],8:[function(require,module,exports){
var Request = require('../request')
var Response = require('../response')
var Dispatcher = require('../dispatcher')

module.exports = Client

function Client(client) {
  this._client = client
}

Client.prototype.doRequest = function (ctx, cb) {
  ctx = ctx || {}
  var res = new Response(ctx)
  return this._client.ctx.agent(ctx, res, cb)
}

Client.prototype.newRequest = function (client) {
  var req = new Request
  req.useParent(client || this._client)
  return req
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function (opts, cb) {
    opts.method = method
    return this.doRequest(opts, cb)
  }
})

},{"../dispatcher":7,"../request":19,"../response":20}],9:[function(require,module,exports){
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

},{"../utils":27,"./client":8}],10:[function(require,module,exports){
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
var extend = require('../utils').extend

module.exports = Entity

function Entity(name) {
  Request.call(this)
  this.name = name
  this.aliases = []
  this.entities = []
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

Entity.prototype.meta = function (meta) {
  var store = this.ctx.store

  var data = store.get('meta')
  if (data) {
    meta = extend(data, meta)
  }

  store.set('meta', meta)
  return this
}

Entity.prototype.render = function (client) {
  return new engine.Generator(client || this).render()
}

Entity.prototype.renderAll = function (client) {
  if (this.parent) {
    return this.parent.renderAll(client)
  }
  return this.render(client || this)
}

function invalidEntity(entity) {
  return !entity || typeof entity.render !== 'function'
}

},{"../context":6,"../engine":10,"../request":19,"../utils":27}],14:[function(require,module,exports){
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
  var self = this

  return new Generator(this)
    .bind(resource)
    .render()

  function resource(opts, cb) {
    var req = new Request
    req.useParent(self)

    if (typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }
}

},{"../engine":10,"../request":19,"./entity":13}],17:[function(require,module,exports){
module.exports = {
  map: require('./map')
}

},{"./map":18}],18:[function(require,module,exports){
module.exports = function map(mapper) {
  return function (req, res, next) {
    var body = res.body
    if (!body) return next()

    mapper(body, function (err, body) {
      if (err) return next(err)
      res.body = body
      next()
    })
  }
}

},{}],19:[function(require,module,exports){
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

Request.prototype.useResponse = function (middleware) {
  this.ctx.middleware.use('middleware response', middleware)
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

Request.prototype.interceptor = function (interceptor) {
  this.ctx.middleware.use('before dial', interceptor)
  return this
}

Request.prototype.evaluator = function (evaluator) {
  this.ctx.middleware.use('before response', evaluator)
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

Request.accessors = {
  store: function () {
    return this.ctx.store
  },
  root: function () {
    return this.parent
      ? this.parent.root
      : this
  }
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

},{"./agents":3,"./context":6,"./dispatcher":7,"./middleware":17,"./response":20,"./types":23,"./utils":27}],20:[function(require,module,exports){
module.exports = Response

function Response(req) {
  this.req = req
  this.store = req ? req.store : null
  this.client = req ? req.client : null

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

  this.type =
  this.statusText = ''
}

Response.prototype.setOriginalResponse = function (orig) {
  this.orig = orig
}

Response.prototype.setBody = function (body) {
  this.body = body
  if (~this.type.indexOf('json')) this.json = body
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
  var url = req.url
  var method = req.method
  var status = this.status || this.statusCode

  var msg = 'cannot ' + method + ' ' + url + ' (' + status + ')'
  var err = new Error(msg)
  err.status = status
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

},{}],21:[function(require,module,exports){
module.exports = Store

function Store(parent) {
  this.parent = parent
  this.map = Object.create(null)
}

Store.prototype.getParent = function (key) {
  if (this.parent) return this.parent.get(key)
}

Store.prototype.get = function (key) {
  var value = this.map[key]
  if (value !== undefined) return value
  return this.getParent(key)
}

Store.prototype.set = function (key, value) {
  if (key) this.map[key] = value
}

Store.prototype.setParent = function (key, value) {
  if (this.parent) this.parent.set(name, value)
}

Store.prototype.useParent = function (parent) {
  this.parent = parent
}

Store.prototype.remove = function (key) {
  this.map[key] = undefined
}

Store.prototype.has = function (key) {
  return this.get(key) !== undefined
}

},{}],22:[function(require,module,exports){
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

},{"./agents":3,"./context":6,"./dispatcher":7,"./engine":10,"./entities":14,"./request":19,"./response":20}],23:[function(require,module,exports){
module.exports = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
}

},{}],24:[function(require,module,exports){
module.exports = function clone(y) {
  var x = {}
  for (var k in y) x[k] = y[k]
  return x
}

},{}],25:[function(require,module,exports){
var clone = require('./clone')

module.exports = function extend(x, y) {
  x = x || {}
  for (var k in y) x[k] = y[k]
  return x
}

},{"./clone":24}],26:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty

module.exports = function has(o, name) {
  return !!o && hasOwn.call(o, name)
}

},{}],27:[function(require,module,exports){
module.exports = {
  has: require('./has'),
  once: require('./once'),
  lower: require('./lower'),
  merge: require('./merge'),
  clone: require('./clone'),
  series: require('./series'),
  extend: require('./extend'),
  normalize: require('./normalize'),
  pathParams: require('./path-params')
}

},{"./clone":24,"./extend":25,"./has":26,"./lower":28,"./merge":29,"./normalize":30,"./once":31,"./path-params":32,"./series":33}],28:[function(require,module,exports){
module.exports = function lower(str) {
  return typeof str === 'string'
    ? str.toLowerCase()
    : ''
}

},{}],29:[function(require,module,exports){
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

},{"./clone":24,"./extend":25}],30:[function(require,module,exports){
module.exports = function normalize(o) {
  var buf = {}
  Object.keys(o || {}).forEach(function (name) {
    buf[name.toLowerCase()] = o[name]
  })
  return buf
}

},{}],31:[function(require,module,exports){
module.exports = function once(fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    fn.apply(null, arguments)
  }
}

},{}],32:[function(require,module,exports){
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
      return new Error('Missing path param: ' + param)
    }

    path = path.replace(':' + param, params[param])
  }

  return path
}

},{}],33:[function(require,module,exports){
var once = require('./once')
var slicer = Array.prototype.slice

module.exports = function series(arr, cb, ctx) {
  var stack = arr.slice()
  cb = cb || function () {}

  function next(err) {
    if (err) return cb.apply(ctx, arguments)

    var fn = stack.shift()
    if (!fn) return cb.apply(ctx, arguments)

    var args = slicer.call(arguments, 1)
    fn.apply(ctx, args.concat(once(next)))
  }

  next()
}

},{"./once":31}],34:[function(require,module,exports){

},{}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
var midware = require('midware')
var MiddlewarePool = require('./pool')

module.exports = pool

function pool(parent) {
  return new MiddlewarePool(parent)
}

pool.Pool = 
pool.MiddlewarePool = MiddlewarePool
pool.midware = midware
},{"./pool":37,"midware":38}],37:[function(require,module,exports){
var midware = require('midware')

module.exports = MiddlewarePool

function MiddlewarePool(parent) {
  this.ctx = null
  this.pool = Object.create(null)
  if (parent) this.useParent(parent)
}

MiddlewarePool.prototype.registered = function (name) {
  return typeof this.pool[name] === 'function'
}

MiddlewarePool.prototype.flush = function (name) {
  if (this.registered(name)) {
    this.pool[name].stack.splice(0)
  }
}

MiddlewarePool.prototype.flushAll = function () {
  this.pool = Object.create(null)
}

MiddlewarePool.prototype.remove  = function (name, fn) {
  if (this.registered(name)) {
    this.pool[name].remove(fn)
  }
}

MiddlewarePool.prototype.stack = function (name) {
  if (this.registered(name)) {
    return this.pool[name].stack
  }
}

MiddlewarePool.prototype.useCtx = function (ctx) {
  this.ctx = ctx
}

MiddlewarePool.prototype.useParent = function (parent) {
  if (!(parent instanceof MiddlewarePool))
    throw new TypeError('Invalid parent middleware')

  this.parent = parent
}

MiddlewarePool.prototype.use = function (name, fn) {
  var pool = this.pool[name]
  var args = toArr(arguments, 1)

  if (!pool) {
    pool = this.pool[name] = midware(this.ctx)
  }

  if (Array.isArray(fn)) {
    args = fn
  }

  pool.apply(null, args)
}

MiddlewarePool.prototype.runParent = function (args, done) {
  if (!this.parent) return done()
  this.parent.run.apply(this.parent, args.concat(done))
}

MiddlewarePool.prototype.run = function (name /* ...args, done */) {
  var pool = this.pool
  var args = toArr(arguments)
  var done = args.pop()

  this.runParent(args, run)

  function run(err, end) {
    if (err || end) return done(err, end)

    var middleware = pool[name]
    if (!middleware) return done()

    middleware.run.apply(null, args.slice(1).concat(done))
  }
}

function toArr(args, index) {
  return [].slice.call(args, index || 0)
}

},{"midware":38}],38:[function(require,module,exports){
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

},{}]},{},[22])(22)
});