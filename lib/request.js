var merge = require('./utils').merge
var types = require('./types')
var Context = require('./context')
var Dispatcher = require('./dispatcher')

module.exports = Request

function Request(ctx) {
  this.ctx = new Context(ctx)
}

Request.prototype.method = function (name) {
  this.opts.method = name
  return this
}

Request.prototype.param = function (name, value) {
  this.ctx.params[name] = value
  return this
}

Request.prototype.path = function (path) {
  this.ctx.opts.path = path
  return this
}

Request.prototype.set = function (name, value) {
  this.ctx.headers[name] = value
  return this
}

Request.prototype.unset = function (name) {
  delete this.ctx.headers[name]
  return this
}

Request.prototype.type = function (value) {
  this.ctx.headers['content-type'] = types[value] || value
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

Request.prototype.use = function (middleware) {
  this.ctx.mw.request(middleware)
  return this
}

Request.prototype.useResponse = function (middleware) {
  this.ctx.mw.response(middleware)
  return this
}

Request.prototype.validate = function (middleware) {
  this.ctx.validators.request(middleware)
  return this
}

Request.prototype.validateResponse = function (middleware) {
  this.ctx.validators.response(middleware)
  return this
}

Request.prototype.end = function (cb) {
  return new Dispatcher(this.ctx).run(cb)
}

Request.prototype.options = function (opts) {
  var curr = this.ctx.opts
  Object.keys(opts)
  .filter(function (kind) {
    return opts[kind] && typeof opts[kind] === 'object'
  })
  .forEach(function (kind) {
    curr[kind] = merge(curr[kind], opts[kind])
  })
  return this
}
