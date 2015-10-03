var merge = require('./utils').merge
var types = require('./types')
var Context = require('./context')
var Dispatcher = require('./dispatcher')

module.exports = Request

function Request(ctx) {
  this.ctx = ctx
  this.opts = ctx.getHttpParams()
  this._ctx = new Context

  this.params = {}
  this.query = {}
  this.headers = {}
  this.cookies = {}
}

Request.prototype.param = function (name, value) {
  this.params[name] = value
  return this
}

Request.prototype.path = function (path) {
  this.opts.path = path
  return this
}

Request.prototype.set = function (name, value) {
  this.headers[name] = value
  return this
}

Request.prototype.unset = function (name) {
  delete this.headers[name]
  return this
}

Request.prototype.type = function (value) {
  this.headers['content-type'] = types[value] || value
  return this
}

Request.prototype.send =
Request.prototype.body = function (data) {
  this.data = data
  return this
}

Request.prototype.cookie = function (name, value) {
  this.cookies[name] = value
  return this
}

Request.prototype.unsetCookie = function (name) {
  delete this.cookies[name]
  return this
}

Request.prototype.use = function (middleware) {

}

Request.prototype.useResponse = function (middleware) {

}

Request.prototype.end = function (cb) {
  cb = cb || noop
  return new Dispatcher(this).run(cb)
}

Request.prototype.options = function (opts) {
  var curr = this.opts
  Object.keys(opts)
  .filter(function (kind) {
    return opts[kind] && typeof opts[kind] === 'object'
  })
  .forEach(function (kind) {
    curr[kind] = merge(curr[kind], opts[kind])
  })
  return this
}

function noop() {}
