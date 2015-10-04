var mw = require('midware')
var utils = require('./utils')
var types = require('./types')
var Builder = require('./builder')
var Context = require('./context')

module.exports = Base

function Base() {
  this.name = null
  this.parent = null

  this.aliases = []
  this.methods = []
  this.resources = []
  this.collections = []

  this.ctx = new Context
}

Base.prototype.useParent = function (parent) {
  if (!(parent instanceof Base))
    throw new TypeError('Parent context is not a valid argument')

  this.parent = parent
  this.ctx.useParent(parent.ctx)

  return this
}

Base.prototype.url = function (url) {
  this.ctx.opts.rootUrl = url
  return this
}

Base.prototype.method = function (name) {
  this.ctx.opts.method = name
  return this
}

Base.prototype.basePath = function (path) {
  this.ctx.opts.basePath = path
  return this
}

Base.prototype.path = function (path) {
  this.ctx.opts.path = path
  return this
}

Base.prototype.param = function (name, value) {
  this.ctx.params[name] = value
  return this
}

Base.prototype.queryParam = function (name, value) {
  this.ctx.query[name] = value
  return this
}

Base.prototype.type = function (value) {
  this.ctx.headers['content-type'] = types[value] || value
  return this
}

Base.prototype.set = function (name, value) {
  this.ctx.headers[name] = value
  return this
}

Base.prototype.unset = function (name) {
  delete this.ctx.headers[name]
  return this
}

Base.prototype.headers = function (headers) {
  this.ctx.headers = headers
  return this
}

/**
 * Attach entities
 */

Base.prototype.alias = function (name) {
  this.aliases.push(name)
  return this
}

Base.prototype.collection = function (collection) {
  if (!(collection instanceof Base.Collection)) {
    collection = new Base.Collection(collection)
  }

  collection.useParent(this)
  this.collections.push(collection)

  return collection
}

Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  resource.useParent(this)
  this.resources.push(resource)

  return resource
}

/**
 * Attach a new middleware in the incoming phase
 * @param {Function} middleware
 * @return {this}
 */

Base.prototype.use =
Base.prototype.useRequest = function (middleware) {
  this.ctx.mw.request(middleware)
  return this
}

Base.prototype.useResponse = function (middleware) {
  this.ctx.mw.response(middleware)
  return this
}

Base.prototype.validator =
Base.prototype.requestValidator = function (validator) {
  this.ctx.validators.request(validator)
  return this
}

Base.prototype.responseValidator = function (validator) {
  this.validators.response(validator)
  return this
}

Base.prototype.agent = function (agent, opts) {
  if (typeof agent !== 'function')
    throw new TypeError('agent argument must be a function')

  this.ctx.agent = agent
  if (opts) this.ctx.agentOpts = opts

  return this
}

Base.prototype.agentOpts = function (opts) {
  this.ctx.agentOpts = opts
  return this
}

Base.prototype.render = function (client) {
  return new Builder(client || this).render()
}
