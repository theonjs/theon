var mw = require('midware')
var utils = require('./utils')
var types = require('./types')
var agents = require('./agents')
var Builder = require('./builder')
var Context = require('./context')

module.exports = Base

function Base() {
  this.parent = null

  this.name = null
  this.aliases = []
  this.methods = []
  this.resources = []
  this.collections = []

  this.ctx = new Context()

  // to do: move to context
  this.opts = {}
  this.params = {}
  this.query = {}
  this.headers = {}
  this.cookies = {}

  // to do: move to context
  this.validators = {
    request: mw(this),
    response: mw(this)
  }

  this.mw = {
    request: mw(this),
    response: mw(this)
  }
}

Base.prototype.useParent = function (parent) {
  if (!(parent instanceof Base))
    throw new TypeError('Parent context is not a valid argument')

  this.parent = parent
  setupMiddleware(this, parent)
}

function setupMiddleware(self, parent) {
  ['mw', 'validators'].forEach(function (key) {
    ['request', 'response'].forEach(function (phase) {
      self[key][phase](function () {
        parent[key][phase].run.apply(self, arguments)
      })
    })
  })
}

Base.prototype.url = function (url) {
  this.opts.rootUrl = url
  return this
}

Base.prototype.alias = function (name) {
  this.aliases.push(name)
  return this
}

Base.prototype.basePath = function (path) {
  this.opts.basePath = path
  return this
}

Base.prototype.path = function (path) {
  this.opts.path = path
  return this
}

Base.prototype.param = function (name, value) {
  this.params[name] = value
  return this
}

Base.prototype.queryParam = function (name, value) {
  this.query[name] = value
  return this
}

Base.prototype.type = function (value) {
  this.headers['content-type'] = types[value] || value
  return this
}

Base.prototype.set = function (name, value) {
  this.headers[name] = value
  return this
}

Base.prototype.unset = function (name) {
  delete this.headers[name]
  return this
}

Base.prototype.headers = function (headers) {
  this.headers = headers
  return this
}

/**
 * Attach entities
 */

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

Base.prototype.method = function (name, path) {
  if (typeof name !== 'string')
    throw new TypeError('method argument must be a string')

  var method = new Base.Method(name, path)
  method.useParent(this)
  this.methods.push(method)

  return method
}

/**
 * Attach a new middleware in the incoming phase
 * @param {Function} middleware
 * @return {this}
 */

Base.prototype.use =
Base.prototype.useRequest = function (middleware) {
  this.mw.request(middleware)
  return this
}

Base.prototype.useResponse = function (middleware) {
  this.mw.response(middleware)
  return this
}

Base.prototype.validator =
Base.prototype.requestValidator = function (validator) {
  this.validators.request(validator)
  return this
}

Base.prototype.responseValidator = function (validator) {
  this.validators.response(validator)
  return this
}

Base.prototype.agent = function (agent, opts) {
  if (typeof agent !== 'function')
    throw new TypeError('agent argument must be a function')

  this.httpAgent = agent
  if (opts) this.httpAgentOpts = opts

  return this
}

Base.prototype.agentOpts = function (opts) {
  this.httpAgentOpts = opts
  return this
}

Base.prototype.getHttpParams = function () {
  var parent = {}
  var opts = this.opts

  if (this.parent) parent = this.parent.getHttpParams()

  var basePath = parent.basePath || ''
  var data = utils.merge(parent, opts)
  data.basePath = basePath + (opts.basePath || '')
  data.headers = utils.merge(parent.headers, this.headers)
  data.query = utils.merge(parent.query, this.query)
  data.params = utils.merge(parent.params, this.params)
  data.cookies = utils.merge(parent.cookies, this.cookies)
  data.agentOpts = utils.merge(parent.httpAgentOpts, this.httpAgentOpts)

  return data
}

Base.prototype.render = function (ctx) {
  return new Builder(ctx || this).render()
}
