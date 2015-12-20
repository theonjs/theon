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

function adapter (res, _res) {
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

},{"lil-http":38}],3:[function(require,module,exports){
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
  if (typeof name !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof agent !== 'function') {
    throw new TypeError('agent must be a function')
  }

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
    headers: req.headers,
    method: req.method,
    useQuerystring: true
  }

  // If body exists, pass it in options
  if (req.body) opts.body = req.body

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

  function handler (err, _res, body) {
    cb(err, adapter(res, _res, body))
  }
}

function adapter (res, _res, body) {
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

},{"../../utils":30,"request":37}],6:[function(require,module,exports){
var utils = require('./utils')
var agents = require('./agents')
var Context = require('./context')
var Response = require('./http/response')
var Dispatcher = require('./dispatcher')
var middleware = require('./middleware')

module.exports = Base

/**
 * Base implements a generic interface that is inherited by all
 * the HTTP entities, from configuration to runtime HTTP objects.
 *
 * It provides a convenient methods to attach middleware and observer hooks.
 *
 * @param {Context} ctx - Optional parent context.
 * @constructor
 * @class Base
 */

function Base (ctx) {
  this.parent = null
  this.publicClient = null
  this.plugins = []
  this.ctx = new Context(ctx)
  Base.defineAccessors(this)
}

/**
 * Attach a parent object to the current instance.
 * @param {Base} parent
 * @method useParent
 * @return {this}
 */

Base.prototype.useParent = function (parent) {
  if (!(parent instanceof Base)) {
    throw new TypeError('Parent context is invalid')
  }

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

/**
 * Extend options object.
 * @param {Object} opts
 * @method options
 * @return {this}
 */

Base.prototype.options = function (opts) {
  utils.extend(this.ctx.opts, opts)
  return this
}

/**
 * Force to persist given options.
 * They won't be overwritten.
 *
 * @param {Object} opts
 * @method persistOptions
 * @return {this}
 */

Base.prototype.persistOptions = function (opts) {
  this.ctx.persistent.opts = opts
  return this
}

/**
 * Attach a middleware function to the incoming request phase.
 *
 * @param {Function} middleware
 * @method use
 * @alias useRequest
 * @return {this}
 */

Base.prototype.use =
Base.prototype.useRequest = function (middleware) {
  this.ctx.middleware.use('middleware request', middleware)
  return this
}

/**
 * Attach a middleware function to the request phase, limited
 * to the current entity phase, meaning other entities
 * won't trigger this middleware.
 *
 * @param {Function} middleware
 * @method useEntity
 * @alias useEntityRequest
 * @return {this}
 */

Base.prototype.useEntity =
Base.prototype.useEntityRequest = function (middleware) {
  var phase = 'middleware request ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

/**
 * Attach a middleware function to the response phase.
 *
 * @param {Function} middleware
 * @method useResponse
 * @return {this}
 */

Base.prototype.useResponse = function (middleware) {
  this.ctx.middleware.use('middleware response', middleware)
  return this
}

/**
 * Attach a middleware function to the response phase, limited
 * to the current entity phase, meaning other entities
 * won't trigger this middleware.
 *
 * @param {Function} middleware
 * @method useEntityResponse
 * @return {this}
 */

Base.prototype.useEntityResponse = function (middleware) {
  var phase = 'middleware response ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

/**
 * Attach an observer middleware function to the before request phase.
 *
 * @param {Function} middleware
 * @method before
 * @return {this}
 */

Base.prototype.before = function (middleware) {
  this.ctx.middleware.use('before', middleware)
  return this
}

/**
 * Attach an observer middleware function to the after request phase.
 *
 * @param {Function} middleware
 * @method after
 * @return {this}
 */

Base.prototype.after = function (middleware) {
  this.ctx.middleware.use('after', middleware)
  return this
}

/**
 * Attach a request validator middleware function.
 *
 * @param {Function} middleware
 * @method validator
 * @alias requestValidator
 * @return {this}
 */

Base.prototype.validator =
Base.prototype.requestValidator = function (middleware) {
  this.ctx.middleware.use('validator request', middleware)
  return this
}

/**
 * Attach an entity specific validator middleware
 * function to the request phase.
 *
 * @param {Function} middleware
 * @method entityValidator
 * @alias entityRequestValidator
 * @return {this}
 */

Base.prototype.entityValidator =
Base.prototype.entityRequestValidator = function (middleware) {
  var phase = 'validator request ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

/**
 * Attach a response validator middleware function to the request phase.
 *
 * @param {Function} middleware
 * @method responseValidator
 * @return {this}
 */

Base.prototype.responseValidator = function (middleware) {
  this.ctx.middleware.use('validator response', middleware)
  return this
}

/**
 * Attach an entity specific validator middleware
 * function to the request phase.
 *
 * @param {Function} middleware
 * @method entityResponseValidator
 * @return {this}
 */

Base.prototype.entityResponseValidator = function (middleware) {
  var phase = 'validator response ' + this.entityHierarchy
  this.ctx.middleware.use(phase, middleware)
  return this
}

/**
 * Attach a request interceptor middleware function
 * that will be executed before network dialing phase.
 *
 * @param {Function} interceptor
 * @method interceptor
 * @return {this}
 */

Base.prototype.interceptor = function (interceptor) {
  this.ctx.middleware.use('before dial', interceptor)
  return this
}

/**
 * Attach a request interceptor middleware function limited
 * to the scope of the current entity.
 *
 * @param {Function} interceptor
 * @method entityInterceptor
 * @return {this}
 */

Base.prototype.entityInterceptor = function (interceptor) {
  this.ctx.middleware.use('before dial ' + this.entityHierarchy, interceptor)
  return this
}

/**
 * Attach a request evaluator strategy in order to detemine
 * if the current request was failed or not.
 *
 * @param {Function} evaluator
 * @method evaluator
 * @return {this}
 */

Base.prototype.evaluator = function (evaluator) {
  this.ctx.middleware.use('before response', evaluator)
  return this
}

/**
 * Attach a request evaluator strategy in order to detemine
 * if the current request was failed or not limited to the
 * scope of the current entity.
 *
 * @param {Function} evaluator
 * @method entityEvaluator
 * @return {this}
 */

Base.prototype.entityEvaluator = function (evaluator) {
  this.ctx.middleware.use('before response' + this.entityHierarchy, evaluator)
  return this
}

/**
 * Test if the given request params are valid or not, executing the
 * evaluator pool. Callback will be resolved with error or boolean.
 *
 * @param {Function} cb
 * @method validate
 * @return {this}
 */

Base.prototype.validate = function (cb) {
  var req = this.raw()
  var res = new Response(this.req)
  var dis = new Dispatcher(this)
  dis.runStack('validator', 'request', req, res, cb)
  return this
}

/**
 * Attach a new observer middleware hook to a custom phase.
 *
 * @param {String} phase
 * @param {Function} hook
 * @method observe
 * @return {this}
 */

Base.prototype.observe = function (phase, hook) {
  this.ctx.middleware.use(phase, hook)
  return this
}

/**
 * Attach a new observer middleware hook to a custom phase
 * limited to the scope of the current entity.
 *
 * @param {String} phase
 * @param {Function} hook
 * @method observeEntity
 * @return {this}
 */

Base.prototype.observeEntity = function (phase, hook) {
  this.ctx.middleware.use(phase + ' ' + this.entityHierarchy, hook)
  return this
}

/**
 * Attach a new plugin.
 *
 * @param {Function} plugin
 * @method plugin
 * @alias usePlugin
 * @return {this}
 */

Base.prototype.plugin =
Base.prototype.usePlugin = function (plugin) {
  if (typeof plugin !== 'function') {
    throw new TypeError('plugin must be a function')
  }

  var instance = plugin(this)
  this.plugins.push({ fn: plugin, instance: instance })

  return this
}

/**
 * Retrieve a plugin searching by name or function reference.
 *
 * @param {String|Function} search
 * @method getPlugin
 * @return {Function}
 */

Base.prototype.getPlugin = function (search) {
  return this.plugins.reduce(function (match, plugin) {
    if (match) return match
    if (matches(plugin, search)) return plugin.instance || plugin
    return null
  }, null)

  function matches (plugin, search) {
    return search === plugin.fn ||
      search === plugin.instance ||
      search === plugin.fn.$name ||
      search === plugin.fn.name
  }
}

/**
 * Bind body to a given model.
 *
 * @param {Function} model
 * @method model
 * @return {this}
 */

Base.prototype.model = function (model) {
  this.useResponse(middleware.model(model))
  return this
}

/**
 * Bind a function to map/modify/transform response body.
 *
 * @param {Function} mapper
 * @method map
 * @alias bodyMap
 * @return {this}
 */

Base.prototype.map =
Base.prototype.bodyMap = function (mapper) {
  this.useResponse(middleware.map(mapper))
  return this
}

/**
 * Set the HTTP agent adapter to be used for network dialing.
 *
 * @param {String|Function} agent
 * @method agent
 * @alias useAgent
 * @return {this}
 */

Base.prototype.agent =
Base.prototype.useAgent = function (agent) {
  if (typeof agent === 'string') {
    agent = agents.get(agent)
  }
  if (typeof agent !== 'function') {
    throw new TypeError('unsupported or invalid agent')
  }
  this.ctx.agent = agent
  return this
}

/**
 * Extend the HTTP agent specific options to be used when calling the adapter.
 *
 * @param {Object} opts
 * @method agentOpts
 * @return {this}
 */

Base.prototype.agentOpts = function (opts) {
  utils.extend(this.ctx.agentOpts, opts)
  return this
}

/**
 * Set the HTTP agent specific options to be used when calling the adapter.
 *
 * @param {Object} opts
 * @method setAgentOpts
 * @return {this}
 */

Base.prototype.setAgentOpts = function (opts) {
  this.ctx.agentOpts = opts
  return this
}

/**
 * Set persistent HTTP agent specific options.
 *
 * @param {Object} opts
 * @method persistAgentOpts
 * @return {this}
 */

Base.prototype.persistAgentOpts = function (opts) {
  this.ctx.persistent.agentOpts = opts
  return this
}

/**
 * Retrieve the current context store instance.
 *
 * @method getStore
 * @return {Store}
 */

Base.prototype.getStore = function () {
  return this.ctx.store
}

/**
 * Retrieve the root parent entity.
 *
 * @method getRoot
 * @return {Entity}
 */

Base.prototype.getRoot = function () {
  return this.parent
    ? this.parent.root
    : this
}

/**
 * Retrieve the public API engine client.
 *
 * @method getApi
 * @return {EngineClient}
 */

Base.prototype.getApi = function () {
  return this.parent
    ? this.parent.api
    : this.publicClient
}

/**
 * Retrieve the entity hierarchy based on the parent entities.
 * This method is mostly used internally to trigger entity specific hooks.
 *
 * @method getEntityHierarchy
 * @return {String}
 */

Base.prototype.getEntityHierarchy = function () {
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

/**
 * Define property accessors.
 * @property {Array} accessors
 * @static
 */

Base.accessors = [
  'api',
  'root',
  'store',
  'entityHierarchy'
]

/**
 * Define property accessors to the given Base instance.
 * @param {Entity} base
 * @param {Object} target
 * @method defineAccessors
 * @static
 */

Base.defineAccessors = function (base, target) {
  Base.accessors.forEach(function (key) {
    var method = 'get' + utils.capitalize(key)
    Object.defineProperty(target || base, key, {
      enumerable: true,
      configurable: false,
      get: function () { return base[method]() },
      set: function () { throw new Error('Cannot overwrite protected property') }
    })
  })
}

},{"./agents":3,"./context":7,"./dispatcher":8,"./http/response":19,"./middleware":20,"./utils":30}],7:[function(require,module,exports){
var Middleware = require('midware-pool')
var agents = require('./agents')
var Store = require('./store')
var utils = require('./utils')

module.exports = Context

/**
 * Context provides a hierarhical domain specific interface
 * used by each HTTP transaction configure and store HTTP data and middleware.
 *
 * Context provides a consistent interface for internal use and
 * middleware/plugin developers.
 *
 * @param {Context} ctx - Optional parent context.
 * @constructor
 * @class Context
 */

function Context (ctx) {
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

  this.store = new Store()
  this.middleware = new Middleware()

  if (ctx) this.useParent(ctx)
}

/**
 * Stores protected instance properties.
 *
 * @property {Array} fields
 * @static
 */

Context.fields = [
  'opts',
  'headers',
  'query',
  'params',
  'cookies',
  'agentOpts'
]

/**
 * Attaches a new entity as parent entity.
 *
 * @param {Context} parent
 * @method useParent
 * @return {this}
 */

Context.prototype.useParent = function (parent) {
  this.parent = parent

  ;['middleware', 'store'].forEach(function (key) {
    this[key].useParent(parent[key])
  }, this)

  return this
}

/**
 * Returns the current context data as raw object.
 *
 * @method raw
 * @return {Object}
 */

Context.prototype.raw = function () {
  var data = this.merge()
  data.agent = this.agent

  // Expose needed members
  data.ctx = this
  data.store = this.store

  // Set defaults
  if (!data.method) data.method = 'GET'

  return data
}

/**
 * Merges current context and parent context data.
 *
 * @method merge
 * @return {Object}
 */

Context.prototype.merge = function () {
  var data = {}
  var parent = this.parent ? this.parent.raw() : {}

  ;['method', 'body', 'stream'].forEach(function (name) {
    data[name] = this[name] || parent[name] || null
  }, this)

  Context.fields.forEach(function (name) {
    var merger = name === 'headers' ? mergeHeaders : utils.merge
    data[name] = merger(parent[name], this[name], this.persistent[name])
  }, this)

  var url = this.opts.rootUrl
  if (url) data.opts.rootUrl = url

  return data
}

/**
 * Merge current context and parent path params.
 *
 * @method renderParams
 * @return {Object}
 */

Context.prototype.renderParams = function (req) {
  var params = req.params = req.params || {}
  var ctx = this

  Object.keys(params).forEach(function (key) {
    if (typeof params[key] === 'function') {
      params[key] = params[key](ctx, req)
    }
  })

  return params
}

/**
 * Creates another context inheriting data from the current instance.
 *
 * @method clone
 * @return {Context}
 */

Context.prototype.clone = function () {
  var ctx = new Context()
  return ctx.useParent(this)
}

/**
 * Builds the current path.
 *
 * @method buildPath
 * @return {String}
 */

Context.prototype.buildPath = function () {
  return Context.buildPath(this)
}

/**
 * Build URL path.
 *
 * @method buildPath
 * @static
 */

Context.buildPath = function buildPath (ctx) {
  var base = ''

  if (ctx.parent) {
    base += buildPath(ctx.parent)
  }

  var opts = ctx.opts
  var head = opts.basePath || ''
  var tail = opts.path || ''

  return base + head + tail
}

function mergeHeaders () {
  return utils.normalize(utils.merge.apply(null, arguments))
}

},{"./agents":3,"./store":23,"./utils":30,"midware-pool":39}],8:[function(require,module,exports){
var utils = require('./utils')
var Response = require('./http/response')

module.exports = Dispatcher

/**
 * Dispatcher implements an HTTP traffic dispatcher encapsulating
 * the middleware control flow, state and error handling when
 * communicating with the HTTP agent via agent adapter.
 *
 * @param {Request} req - Outgoing request.
 * @constructor
 * @class Dispatcher
 */

function Dispatcher (req) {
  this.req = req
}

/**
 * Trigger the dispatcher process for the current request.
 *
 * @param {Function} cb
 * @return {Request}
 * @method run
 */

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var ctx = this.req.ctx
  var req = this.req.raw()
  var res = new Response(req)

  function done (err, _req, res) {
    _req = _req || req

    // Cache client instance
    var client = this.req

    // If request was intercepted, ignore the error
    if (err === 'intercept') err = null

    // Set request context, if not present
    if (res && !res.req) res.req = _req

    // Resolve the callback
    if (!err) return cb(null, res, client)

    // Expose the error in the request
    _req.error = err

    // Dispatch the error hook
    ctx.middleware.run('error', _req, res, function (_err, _res) {
      cb(_err || err, _res || res, client)
    })
  }

  utils.series([
    function before (next) {
      this.before(req, res, next)
    },
    function dial (req, res, next) {
      this.dial(req, res, next)
    },
    function after (req, res, next) {
      this.after(req, res, next)
    }
  ], done, this)

  return this.req
}

/**
 * Trigger the before phase.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method before
 */

Dispatcher.prototype.before = function (req, res, next) {
  utils.series([
    function before (next) {
      this.runHook('before', req, res, next)
    },
    function request (req, res, next) {
      this.runPhase('request', req, res, next)
    }
  ], next, this)
}

/**
 * Trigger the after phase.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method after
 */

Dispatcher.prototype.after = function (req, res, next) {
  utils.series([
    function response (next) {
      this.runPhase('response', req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after', req, res, next)
    }
  ], next, this)
}

/**
 * Trigger the network dialing phase.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method dial
 */

Dispatcher.prototype.dial = function (req, res, next) {
  var url = req.opts.rootUrl || ''
  var path = req.ctx.buildPath()
  var params = req.ctx.renderParams(req)
  var fullPath = utils.pathParams(path, params)

  // If returned an error, fail with it
  if (fullPath instanceof Error) return next(fullPath)

  // Compose the full URL
  req.url = url + fullPath

  utils.series([
    function before (next) {
      this.runMiddleware('before dial', req, res, next)
    },
    function (req, res, next) {
      this.doDial(req, res, next)
    },
    function after (req, res, next) {
      this.runMiddleware('after dial', req, res, next)
    }
  ], next, this)
}

/**
 * Performs HTTP network dialing.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method doDial
 */

Dispatcher.prototype.doDial = function (req, res, next) {
  var nextFn = utils.once(forward(req, res, next))

  // Call the HTTP agent adapter
  res.orig = req.ctx.agent(req, res, nextFn)

  // Handle writable stream pipes
  if (res.orig && res.orig.pipe) {
    (req.pipes || this.req.pipes || []).forEach(res.orig.pipe, res.orig)
  }

  // Dispatch the dialing observer
  this.runMiddleware('dialing', req, res, onDialing)

  function onDialing (err) {
    if (err && res.orig && typeof res.orig.abort === 'function') {
      nextFn(new Error('Request aborted: ' + (err.message || err)))
      try { res.orig.abort() } catch (e) {}
    }
  }
}

/**
 * Runs a custom hook by event name.
 *
 * @param {String} event
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method runHook
 */

Dispatcher.prototype.runHook = function (event, req, res, next) {
  utils.series([
    function global (next) {
      this.runMiddleware(event, req, res, next)
    },
    function entity (req, res, next) {
      this.runEntity(event, req, res, next)
    }
  ], next, this)
}

/**
 * Runs a custom hook phase by name.
 *
 * @param {String} phase
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method runPhase
 */

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  utils.series([
    function before (next) {
      this.runHook('before ' + phase, req, res, next)
    },
    function middleware (req, res, next) {
      this.runStack('middleware', phase, req, res, next)
    },
    function validate (req, res, next) {
      this.runStack('validator', phase, req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after ' + phase, req, res, next)
    }
  ], next, this)
}

/**
 * Runs a custom middleware stack by name.
 *
 * @param {String} stack
 * @param {String} phase
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method runStack
 */

Dispatcher.prototype.runStack = function (stack, phase, req, res, next) {
  var event = stack + ' ' + phase

  utils.series([
    function before (next) {
      this.runHook('before ' + event, req, res, next)
    },
    function run (req, res, next) {
      this.runMiddleware(event, req, res, next)
    },
    function runEntity (req, res, next) {
      this.runEntity(event, req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after ' + event, req, res, next)
    }
  ], next, this)
}

/**
 * Runs a middleware stack by entity name.
 *
 * @param {String} event
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method runEntity
 */

Dispatcher.prototype.runEntity = function (event, req, res, next) {
  if (!req.client) return next(null, req, res)

  var hierarchy = req.client.entityHierarchy
  if (!hierarchy) return next(null, req, res)

  var phase = event + ' ' + hierarchy
  this.runMiddleware(phase, req, res, next)
}

/**
 * Runs a context middleware stack by name.
 *
 * @param {String} event
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method runMiddleware
 */

Dispatcher.prototype.runMiddleware = function (event, req, res, next) {
  req.ctx.middleware.run(event, req, res, forward(req, res, next))
}

function forward (req, res, next) {
  return function (err, _res) {
    next(err, req, _res || res)
  }
}

function noop () {}

},{"./http/response":19,"./utils":30}],9:[function(require,module,exports){
var Base = require('../base')
var Request = require('../http/request')
var Response = require('../http/response')

module.exports = Client

/**
 * EngineClient the root public API interface generated by the rendered.
 *
 * Provides full middleware capabitilies.
 *
 * @param {Client} client - Root Client entity instance.
 * @constructor
 * @class EngineClient
 */

function Client (client) {
  this._client = client
  this._client.publicClient = this
  Base.defineAccessors(this._client, this)
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

// Delegate base generic methods to the Client base prototype
Object.keys(Base.prototype).forEach(function (method) {
  Client.prototype[method] = function () {
    var ctx = this._client[method].apply(this._client, arguments)
    return ctx === this._client
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

},{"../base":6,"../http/request":18,"../http/response":19}],10:[function(require,module,exports){
var Client = require('./client')
var has = require('../utils').has

module.exports = Generator

/**
 * Generator is responsible of the API rendering of a given Entity instance
 * based on recursive child entities instrospection.
 *
 * @param {Entity} entity - Client entity to render.
 * @constructor
 * @class Generator
 */

function Generator (entity) {
  this.src = entity
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

  // Expose the original client, if empty
  if (!this.target._client) this.target._client = src

  // Render nested entities
  this.src.entities.forEach(this.renderEntity, this)

  // Render prototype chain, if present
  if (src.proto) this.renderProto()

  return this.target
}

Generator.prototype.renderEntity = function (entity) {
  var name = entity.name
  if (!name) throw new TypeError('Render error: missing entity name')

  var value = entity.renderEntity()
  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    this.define(name, value)
  }, this)
}

Generator.prototype.renderProto = function () {
  Object.keys(this.src.proto).forEach(function (name) {
    this.define(name, this.src.proto[name])
  }, this)
}

Generator.prototype.define = function (name, value) {
  if (has(this.target, name)) throw nameConflict(name)

  Object.defineProperty(this.target, name, {
    enumerable: true,
    configurable: false,
    get: function () { return value },
    set: function () { throw new Error('Cannot overwrite property: ' + name) }
  })
}

function nameConflict (name) {
  return new Error('Naming conflict: "' + name + '" property is already used')
}

},{"../utils":30,"./client":9}],11:[function(require,module,exports){
module.exports = {
  Client: require('./client'),
  Generator: require('./generator')
}

},{"./client":9,"./generator":10}],12:[function(require,module,exports){
var Entity = require('./entity')

module.exports = Client

/**
 * Client implements a top level HTTP entity designed
 * to host other child entities, such as Collections, Resources, Mixins or event other Clients.
 * providing a middleware capable interface and HTTP DSL.
 *
 * @param {String} url - Optional base URL.
 * @constructor
 * @class Client
 * @extends Entity
 */

function Client (url) {
  Entity.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Entity.prototype)

Client.prototype.entity = 'client'

},{"./entity":14}],13:[function(require,module,exports){
var Entity = require('./entity')

module.exports = Entity.Collection = Collection

/**
 * Collection is generic entity designed to host
 * other entities, such as resources, mixins or even other collections.
 *
 * Collection has middleware capabitilies and full HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Collection
 * @extends Entity
 */

function Collection (name) {
  Entity.call(this, name)
}

Collection.prototype = Object.create(Entity.prototype)

Collection.prototype.entity = 'collection'

},{"./entity":14}],14:[function(require,module,exports){
var engine = require('../engine')
var Request = require('../http/request')
var extend = require('../utils').extend

module.exports = Entity

/**
 * Entity provides a generic abstract interface designed
 * that's inherited by top-level entities in order to provide
 * convenient methods to extend entities with child entities
 * and some additional helpers.
 *
 * Extends from Request, then it provides middleware
 * capabilities and HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Entity
 * @extends Request
 */

function Entity (name) {
  Request.call(this)
  this.name = name
  this.aliases = []
  this.entities = []
  this.proto = Object.create(null)
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
  return this.addEntity(mixin)
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

Entity.prototype.getCollection = function (name) {
  return this.getEntity(name, 'collection')
}

Entity.prototype.getResource = function (name) {
  return this.getEntity(name, 'resource')
}

Entity.prototype.getMixin = function (name) {
  return this.getEntity(name, 'mixin')
}

Entity.prototype.getClient = function (name) {
  return this.getEntity(name, 'client')
}

Entity.prototype.getEntity = function (name, type) {
  return this.entities.reduce(function (match, entity) {
    if (match) return match
    if (entity.name === name && (!type || (entity.entity === type))) {
      return entity
    }
    return null
  }, null)
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

Entity.prototype.extend = function (prop, value) {
  if (typeof prop === 'string') this.proto[prop] = value
  else if (prop === Object(prop)) extend(this.proto, prop)
  return this
}

Entity.prototype.render = function (client) {
  if (this.parent) {
    return this.parent.render(client)
  }
  return this.renderEntity(client)
}

Entity.prototype.renderEntity = function (client) {
  return new engine.Generator(client || this).render()
}

function invalidEntity (entity) {
  return !entity || typeof entity.renderEntity !== 'function'
}

},{"../engine":11,"../http/request":18,"../utils":30}],15:[function(require,module,exports){
module.exports = {
  Mixin: require('./mixin'),
  Entity: require('./entity'),
  Client: require('./client'),
  Resource: require('./resource'),
  Collection: require('./collection')
}

},{"./client":12,"./collection":13,"./entity":14,"./mixin":16,"./resource":17}],16:[function(require,module,exports){
var Entity = require('./entity')

module.exports = Entity.Mixin = Mixin

/**
 * Mixin is a simple entity designed to host
 * custom logic encapsulated in a function.
 *
 * It provides a convenient way to extend parent
 * entity features with more accurated features.
 *
 * Mixin has middleware capabitilies and full HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @param {Function} fn - Mixin function.
 * @constructor
 * @class Mixin
 * @extends Entity
 */

function Mixin (name, fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('mixin must be a function')
  }

  Entity.call(this, name)
  this.fn = fn
}

Mixin.prototype = Object.create(Entity.prototype)

Mixin.prototype.entity = 'mixin'

Mixin.prototype.renderEntity = function () {
  var self = this
  return function () {
    return self.fn.apply(self, arguments)
  }
}

Mixin.prototype.mixin =
Mixin.prototype.helper =
Mixin.prototype.action =
Mixin.prototype.resource =
Mixin.prototype.collection =
Mixin.prototype.getMixin =
Mixin.prototype.getClient =
Mixin.prototype.getEntity =
Mixin.prototype.getResource =
Mixin.prototype.getCollection = function () {
  throw new Error('not implemented')
}

},{"./entity":14}],17:[function(require,module,exports){
var Entity = require('./entity')
var Request = require('../http/request')
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

/**
 * Resource is a simple entity designed to be attached
 * to concrete HTTP resources, such as an API endpoint.
 *
 * Resource has middleware capabitilies and full HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Resource
 * @extends Entity
 */

function Resource (name) {
  Entity.call(this, name)
}

Resource.prototype = Object.create(Entity.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.renderEntity = function () {
  var self = this

  return new Generator(this)
    .bind(resource)
    .render()

  function resource (opts, cb) {
    var req = new Request()
    req.useParent(self)

    if (opts === Object(opts)) req.options(opts)
    if (typeof opts === 'function') cb = opts

    return typeof cb === 'function'
      ? req.end(cb)
      : req
  }
}

},{"../engine":11,"../http/request":18,"./entity":14}],18:[function(require,module,exports){
var Base = require('../base')
var types = require('../types')
var utils = require('../utils')
var Dispatcher = require('../dispatcher')
var hasPromise = typeof Promise === 'function'

module.exports = Request

/**
 * Request implements a HTTP domain specific DSL API to declare
 * HTTP fields and configure an outgoing request.
 *
 * Inherits from Base in order to provide middleware capabilities.
 *
 * @param {Context} ctx - Optional parent context.
 * @constructor
 * @class Request
 * @extends Base
 */

function Request (ctx) {
  Base.call(this, ctx)
  this.pipes = []
  this.dispatcher = null
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

Request.prototype.dispatch = function (cb) {
  // If already dispatched, just ignore it
  if (this.dispatcher) return this

  // Create and assign the HTTP dispatcher
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
  if (!hasPromise) return throwPromiseError()
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

function throwPromiseError () {
  throw new Error('Native promises are not supported. Use callback instead via: .end(cb)')
}

function noop () {}

},{"../base":6,"../dispatcher":8,"../types":25,"../utils":30}],19:[function(require,module,exports){
module.exports = Response

/**
 * Response provides a generic, abstract, consistent and simple DSL interface
 * with additional sintax sugar to deal effectively with HTTP response
 * fields via a read/write API that is consumed by both agent adapters and end users.
 *
 * Since theon is HTTP agent agnostic, agent adapter implementors
 * should know about the Response write API in order to provide a
 * consistent behavior and data to higher layer.
 *
 * @param {Request} req - Outgoing request.
 * @constructor
 * @class Response
 */

function Response (req) {
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
  Object.keys(headers).forEach(function (key) {
    this.headers[key.toLowerCase()] = headers[key]
  }, this)

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

  this.info = type === 1
  this.ok = type === 2
  this.clientError = type === 4
  this.serverError = type === 5

  this.error = (type === 4 || type === 5)
    ? this.toError()
    : false

  // sugar
  this.accepted = status === 202
  this.noContent = status === 204
  this.badRequest = status === 400
  this.unauthorized = status === 401
  this.notAcceptable = status === 406
  this.notFound = status === 404
  this.forbidden = status === 403
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

function params (str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */)
    var key = parts.shift()
    var val = parts.shift()
    if (key && val) obj[key] = val
    return obj
  }, {})
}

function type (str) {
  return str.split(/ *; */).shift()
}

},{}],20:[function(require,module,exports){
module.exports = {
  map: require('./map'),
  model: require('./model')
}

},{"./map":21,"./model":22}],21:[function(require,module,exports){
module.exports = function map (mapper) {
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

},{}],22:[function(require,module,exports){
module.exports = function bindModel (model) {
  if (typeof model !== 'function') {
    throw new TypeError('model must be a function')
  }

  return function (req, res, next) {
    var body = res.body
    if (body) res.model = model(body, req, res)
    next()
  }
}

},{}],23:[function(require,module,exports){
module.exports = Store

/**
 * Store implements a simple hierarhical polymorfic data store,
 * also providing a convenient and handy interface to deal with stored data.
 *
 * @param {Store} store - Optional parent store.
 * @constructor
 * @class Store
 */

function Store (store) {
  this.parent = store
  this.map = Object.create(null)
}

/**
 * Get value looking by key in parent stores.
 *
 * @param {String} key
 * @return {Mixed}
 * @method getParent
 */

Store.prototype.getParent = function (key) {
  if (this.parent) return this.parent.get(key)
}

/**
 * Get value looking by key in current and parent stores.
 *
 * @param {String} key
 * @return {Mixed}
 * @method get
 */

Store.prototype.get = function (key) {
  var value = this.map[key]
  if (value !== undefined) return value
  return this.getParent(key)
}

/**
 * Set a value by key in current store.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Mixed}
 * @method set
 */

Store.prototype.set = function (key, value) {
  if (key) this.map[key] = value
}

/**
 * Set a value by key in the parent store.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Mixed}
 * @method setParent
 */

Store.prototype.setParent = function (key, value) {
  if (this.parent) this.parent.set(key, value)
}

/**
 * Attaches a new parent store.
 *
 * @param {Store} parent
 * @method useParent
 */

Store.prototype.useParent = function (parent) {
  this.parent = parent
}

/**
 * Removes a key and value in the current store.
 *
 * @param {String} key
 * @method remove
 */

Store.prototype.remove = function (key) {
  this.map[key] = undefined
}

/**
 * Checks if the given key exists in current and parent stores.
 *
 * @param {String} key
 * @return {Boolean}
 * @method has
 */

Store.prototype.has = function (key) {
  return this.get(key) !== undefined
}

},{}],24:[function(require,module,exports){
module.exports = Theon

/**
 * Creates a new Theon API client
 *
 * @param {String} url
 * @return {Client}
 * @class Theon
 */

function Theon (url) {
  return new Theon.entities.Client(url)
}

/**
 * Export HTTP request abstraction
 * @property {Request} Request
 * @static
 */

Theon.Request = require('./http/request')

/**
 * Export HTTP response abstraction
 * @property {Response} Response
 * @static
 */

Theon.Response = require('./http/response')

/**
 * Export context module
 * @property {Context} Context
 * @static
 */

Theon.Context = require('./context')

/**
 * Export store module
 * @property {Store} Store
 * @static
 */

Theon.Store = require('./store')

/**
 * Base client interface shared across all the entities,
 * providing the middleware layer and convenient helper methods
 * @property {Store} Store
 * @static
 */

Theon.Base = require('./base')

/**
 * Export traffic dispatcher module
 * @property {Dispatcher} Dispatcher
 * @static
 */

Theon.Dispatcher = require('./dispatcher')

/**
 * Export HTTP agents module
 * @property {Object} agents
 * @static
 */

Theon.agents = require('./agents')

/**
 * Export engine modules
 * @property {Object} engine
 * @static
 */

Theon.engine = require('./engine')

/**
 * Export built-in entities constructors
 * @property {Object} agents
 * @static
 */

Theon.entities = require('./entities')

/**
 * Creates a new client entity
 * @param {String} url
 * @method client
 * @return {Client}
 * @static
 */

/**
 * Creates a new resource entity
 * @param {String} name
 * @method resource
 * @return {Resource}
 * @static
 */

/**
 * Creates a new collection entity
 * @param {String} name
 * @method collection
 * @return {Collection}
 * @static
 */

/**
 * Creates a new mixin entity
 * @param {String} url
 * @method mixin
 * @return {Mixin}
 * @static
 */

Object.keys(Theon.entities).forEach(function (name) {
  Theon[name.toLowerCase()] = function (x, y) {
    return new Theon.entities[name](x, y)
  }
})

/**
 * Current library version
 * @property {String} VERSION
 * @static
 */

Theon.VERSION = '0.1.18'

/**
 * Force to define a max stack trace
 * @ignore
 */

Error.stackTraceLimit = 10

},{"./agents":3,"./base":6,"./context":7,"./dispatcher":8,"./engine":11,"./entities":15,"./http/request":18,"./http/response":19,"./store":23}],25:[function(require,module,exports){
module.exports = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
}

},{}],26:[function(require,module,exports){
module.exports = function capitalize (str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

},{}],27:[function(require,module,exports){
module.exports = function clone (y) {
  var x = {}
  if (Object(y) !== y) return x
  for (var k in y) x[k] = y[k]
  return x
}

},{}],28:[function(require,module,exports){
module.exports = function extend (x, y) {
  x = x || {}
  if (Object(y) !== y) return x
  for (var k in y) x[k] = y[k]
  return x
}

},{}],29:[function(require,module,exports){
module.exports = function has (o, name) {
  return !!o && Object.prototype.hasOwnProperty.call(o, name)
}

},{}],30:[function(require,module,exports){
module.exports = {
  has: require('./has'),
  once: require('./once'),
  lower: require('./lower'),
  merge: require('./merge'),
  clone: require('./clone'),
  series: require('./series'),
  extend: require('./extend'),
  normalize: require('./normalize'),
  capitalize: require('./capitalize'),
  pathParams: require('./path-params')
}

},{"./capitalize":26,"./clone":27,"./extend":28,"./has":29,"./lower":31,"./merge":32,"./normalize":33,"./once":34,"./path-params":35,"./series":36}],31:[function(require,module,exports){
module.exports = function lower (str) {
  return typeof str === 'string'
    ? str.toLowerCase()
    : ''
}

},{}],32:[function(require,module,exports){
var clone = require('./clone')
var extend = require('./extend')
var slicer = Array.prototype.slice

module.exports = function merge (x, y) {
  var args = slicer.call(arguments, 1)
  x = clone(x)

  args.forEach(function (y) {
    extend(x, y)
  })

  return x
}

},{"./clone":27,"./extend":28}],33:[function(require,module,exports){
module.exports = function normalize (o) {
  var buf = {}
  Object.keys(o || {}).forEach(function (name) {
    buf[name.toLowerCase()] = o[name]
  })
  return buf
}

},{}],34:[function(require,module,exports){
module.exports = function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    fn.apply(null, arguments)
  }
}

},{}],35:[function(require,module,exports){
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
  return parse(path).reduce(function (path, token) {
    if (path instanceof Error) return path
    if (typeof token === 'string') return path

    var value = params[token.name]
    if (value == null) {
      return new Error('Missing path param: ' + token.name)
    }

    var type = typeof value
    if (type !== 'string' && type !== 'number') {
      return new Error('Invalid type for path param: ' + token.name + ' = ' + type)
    }

    var replace = new RegExp(':' + token.name, 'g')
    return path.replace(replace, value)
  }, path)
}

function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var suffix = res[6]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

},{}],36:[function(require,module,exports){
var once = require('./once')
var slicer = Array.prototype.slice

module.exports = function series (arr, cb, ctx) {
  var stack = arr.slice()
  cb = cb || function () {}

  function next (err) {
    if (err) return cb.apply(ctx, arguments)

    var fn = stack.shift()
    if (!fn) return cb.apply(ctx, arguments)

    var args = slicer.call(arguments, 1)
    fn.apply(ctx, args.concat(once(next)))
  }

  next()
}

},{"./once":34}],37:[function(require,module,exports){

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
var midware = require('midware')
var MiddlewarePool = require('./pool')

module.exports = pool

function pool(parent) {
  return new MiddlewarePool(parent)
}

pool.Pool = 
pool.MiddlewarePool = MiddlewarePool
pool.midware = midware
},{"./pool":40,"midware":41}],40:[function(require,module,exports){
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

},{"midware":41}],41:[function(require,module,exports){
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

},{}]},{},[24])(24)
});