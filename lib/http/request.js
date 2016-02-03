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

/**
 * Defines the root URL.
 *
 * @param {String} url
 * @return {this}
 * @method url
 */

Request.prototype.url = function (url) {
  this.ctx.opts.rootUrl = url
  return this
}

/**
 * Defines the URL path.
 *
 * @param {String} path
 * @return {this}
 * @method path
 */

Request.prototype.path = function (path) {
  this.ctx.opts.path = path
  return this
}

/**
 * Defines the base URL path.
 *
 * @param {String} path
 * @return {this}
 * @method basePath
 */

Request.prototype.basePath = function (path) {
  this.ctx.opts.basePath = path
  return this
}

/**
 * Defines the HTTP method to be used.
 *
 * @param {String} method
 * @return {this}
 * @method method
 */

Request.prototype.method = function (method) {
  this.ctx.method = method
  return this
}

/**
 * Registers a new path param.
 *
 * @param {String} name
 * @param {String|Number} value
 * @return {this}
 * @method param
 */

Request.prototype.param = function (name, value) {
  this.ctx.params[name] = value
  return this
}

/**
 * Registers multiple path params.
 *
 * @param {Object} params
 * @return {this}
 * @method params
 */

Request.prototype.params = function (params, value) {
  if (params && value) return this.param(params, value)
  utils.extend(this.ctx.params, params)
  return this
}

/**
 * Generic method to persist fields by type.
 *
 * @param {String} type
 * @param {String} name
 * @param {String|Number} value
 * @return {this}
 * @method persistField
 * @protected
 */

Request.prototype.persistField = function (type, name, value) {
  var persistent = this.ctx.persistent
  var types = persistent[type] || {}
  types[name] = value
  persistent[type] = types
  return this
}

/**
 * Registers a persistent path param.
 *
 * @param {String} name
 * @param {String|Number} value
 * @return {this}
 * @method persistParam
 */

Request.prototype.persistParam = function (name, value) {
  return this.persistField('params', name, value)
}

/**
 * Registers a set of persistent path params.
 *
 * @param {Object} params
 * @return {this}
 * @method persistParams
 */

Request.prototype.persistParams = function (params, value) {
  if (params && value) return this.persistParam(params, value)
  utils.extend(this.ctx.persistent.params, params)
  return this
}

/**
 * Unset param by key.
 *
 * @param {String} name
 * @return {this}
 * @method unsetParam
 */

Request.prototype.unsetParam = function (name) {
  delete this.ctx.params[name]
  return this
}

/**
 * Reset params, removing old values and defining new ones.
 *
 * @param {Object} params
 * @return {this}
 * @method setParams
 */

Request.prototype.setParams = function (params) {
  this.ctx.params = params
  return this
}

/**
 * Defines a query param by key and value.
 *
 * @param {String} key
 * @param {String|Number} value
 * @return {this}
 * @method query
 */

Request.prototype.query = function (key, value) {
  if (key && value) return this.queryParam(key, value)
  utils.extend(this.ctx.query, key)
  return this
}

/**
 * Defines a query param by key and value.
 *
 * @param {String} key
 * @param {String|Number} value
 * @return {this}
 * @method queryParam
 */

Request.prototype.queryParam = function (name, value) {
  this.ctx.query[name] = value
  return this
}

/**
 * Unset a query param by key.
 *
 * @param {String} key
 * @return {this}
 * @method unsetQuery
 */

Request.prototype.unsetQuery = function (key) {
  delete this.ctx.query[key]
  return this
}

/**
 * Persists a query param by key and value.
 *
 * @param {String} key
 * @param {String|Number} value
 * @return {this}
 * @method persistQueryParam
 */

Request.prototype.persistQueryParam = function (name, value) {
  return this.persistField('query', name, value)
}

/**
 * Persists a set of query params.
 *
 * @param {Object} query
 * @return {this}
 * @method persistQueryParams
 * @alias persistQuery
 */

Request.prototype.persistQuery =
Request.prototype.persistQueryParams = function (query, value) {
  if (query && value) return this.persistentQueryParam(query, value)
  utils.extend(this.ctx.persistent.query, query)
  return this
}

/**
 * Reset query params, removing old params and defining a new ones.
 *
 * @param {Object} query
 * @return {this}
 * @method setQuery
 */

Request.prototype.setQuery = function (query) {
  this.ctx.query = query
  return this
}

/**
 * Sets a header field by name and value.
 *
 * @param {String} name
 * @param {String|Number} value
 * @return {this}
 * @method set
 * @alias header
 */

Request.prototype.set =
Request.prototype.header = function (name, value) {
  this.ctx.headers[utils.lower(name)] = value
  return this
}

/**
 * Removes a header field by name.
 *
 * @param {String} name
 * @return {this}
 * @method unset
 * @alias removeHeader
 */

Request.prototype.unset =
Request.prototype.removeHeader = function (name) {
  delete this.ctx.headers[utils.lower(name)]
  return this
}

/**
 * Defines a set of headers.
 *
 * @param {Object} headers
 * @return {this}
 * @method headers
 */

Request.prototype.headers = function (headers, value) {
  if (headers && value) return this.set(headers, value)
  utils.extend(this.ctx.persistent.headers, utils.normalize(headers))
  return this
}

/**
 * Reset headers, removing old fields and defining a new ones.
 *
 * @param {Object} headers
 * @return {this}
 * @method setHeaders
 */

Request.prototype.setHeaders = function (headers) {
  this.ctx.headers = utils.normalize(headers)
  return this
}

/**
 * Persist header by name and value.
 *
 * @param {String} name
 * @param {String|Number} value
 * @return {this}
 * @method persistHeader
 */

Request.prototype.persistHeader = function (name, value) {
  var headers = this.ctx.persistent.headers || {}
  headers[utils.lower(name)] = value
  this.ctx.persistent.headers = headers
  return this
}

/**
 * Persist a set of headers.
 *
 * @param {Object} headers
 * @return {this}
 * @method persistHeaders
 */

Request.prototype.persistHeaders = function (headers, value) {
  if (headers && value) return this.persistHeader(headers, value)
  utils.extend(this.ctx.persistent.headers, headers)
  return this
}

/**
 * Defines request MIME content type format.
 *
 * @param {String} type
 * @return {this}
 * @method format
 */

Request.prototype.format = function (type) {
  this.ctx.opts.format = type
  return this
}

/**
 * Defines the response MIME content type.
 *
 * You can pass the MIME expression or the MIME shortcut alias:
 *
 * - html
 * - json
 * - xml
 * - urlencoded
 * - form
 * - form-data
 *
 * @param {String} value
 * @param {String} header - Optional.
 * @return {this}
 * @method type
 * @alias mimeType
 */

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

/**
 * Defines accept MIME content type header.
 *
 * You can pass the MIME expression or the MIME shortcut alias:
 *
 * - html
 * - json
 * - xml
 * - urlencoded
 * - form
 * - form-data
 *
 * @param {String} type
 * @return {this}
 * @method accept
 */

Request.prototype.accept = function (type) {
  return this.type(type, 'accept')
}

/**
 * Defines the request body payload.
 *
 * @param {Mixed} body
 * @return {this}
 * @method body
 * @alias send
 */

Request.prototype.send =
Request.prototype.body = function (body) {
  this.ctx.body = body
  return this
}

/**
 * Defines a cookie by name and value.
 *
 * @param {String} name
 * @param {String} value
 * @return {this}
 * @method cookie
 */

Request.prototype.cookie = function (name, value) {
  this.ctx.cookies[name] = value
  return this
}

/**
 * Deletes a cookie field by name.
 *
 * @param {String} name
 * @return {this}
 * @method unsetCookie
 */

Request.prototype.unsetCookie = function (name) {
  delete this.ctx.cookies[name]
  return this
}

/**
 * Defines the basic HTTP authentication based on user and password.
 *
 * @param {String} user
 * @param {String} password
 * @return {this}
 * @method auth
 */

Request.prototype.auth = function (user, password) {
  this.ctx.opts.auth = { user: user, password: password }
  return this
}

/**
 * Dispatches the current HTTP request generating a new network transaction.
 *
 * This method is mostly used internally.
 * You should not call it directly.
 *
 * @param {String} name
 * @param {String} value
 * @return {this}
 * @method dispatch
 * @protected
 */

Request.prototype.dispatch = function (cb) {
  // If already dispatched, just ignore it
  if (this.dispatcher) {
    cb(new Error('Request already dispatched'))
    return this
  }

  // Create and assign the HTTP dispatcher
  var dispatcher = this.dispatcher = new Dispatcher(this)

  // Push task into the event loop to force asynchronicity
  setTimeout(function () { dispatcher.run(cb) }, 0)

  return this
}

/**
 * Ends the current HTTP request and triggers the network dispatcher.
 *
 * You should call this method to perform the network dialing, optionally passing a callback.
 *
 * @param {Function} cb
 * @return {this}
 * @method end
 * @alias done
 */

Request.prototype.end =
Request.prototype.done = function (cb) {
  return this.dispatch(cb)
}

/**
 * Ends the current HTTP request and triggers the network dispatcher.
 *
 * You should call this method to perform the network dialing using the promise interface.
 *
 * @param {Function} success
 * @param {Function} error
 * @return {Promise}
 * @method then
 */

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

/**
 * Defines a function to catch the error.
 *
 * You can call this method to perform the network dialing using the promise interface.
 * If the request has not been dispatched, calling this method will dispatch the network dialing.
 *
 * @param {Function} error
 * @return {Promise}
 * @method catch
 */

Request.prototype.catch = function (error) {
  if (!hasPromise) return throwPromiseError()
  if (this.promise) return this.promise.catch(error)
  return this.then(noop, error)
}

/**
 * Attaches a new writable stream as target.
 *
 * @param {Stream} stream
 * @return {this}
 * @method pipe
 */

Request.prototype.pipe = function (stream) {
  this.pipes.push(stream)
  return this
}

/**
 * Attaches a body as readable stream source.
 *
 * @param {Stream} stream
 * @return {this}
 * @method stream
 * @alias bodyStream
 */

Request.prototype.stream =
Request.prototype.bodyStream = function (stream) {
  if (!stream || typeof stream.pipe !== 'function') {
    throw new TypeError('Invalid stream interface')
  }

  this.ctx.stream = stream
  return this
}

/**
 * Returns the request as raw mode object.
 *
 * @return {Object}
 * @method raw
 * @protected
 */

Request.prototype.raw = function () {
  var raw = this.ctx.raw()
  raw.client = this
  raw.root = this.root
  return raw
}

/**
 * Clone the current request params and configuration.
 *
 * @return {Object}
 * @method clone
 * @protected
 */

Request.prototype.clone = function () {
  var ctx = this.ctx.clone()
  var req = new Request(ctx)
  req.parent = this.parent
  return req
}

/**
 * Creates a new request based on the existent one, optionally passing a custom context.
 *
 * @param {Context} ctx
 * @return {Object}
 * @method newRequest
 */

Request.prototype.newRequest = function (ctx) {
  var req = new Request()
  req.useParent(ctx || this)
  return req
}

function throwPromiseError () {
  throw new Error('Native promises are not supported. Use callback instead via: .end(cb)')
}

function noop () {}
