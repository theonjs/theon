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
