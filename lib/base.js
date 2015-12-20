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
