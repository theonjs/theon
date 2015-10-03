var Base = require('./base')
var Request = require('./request')

module.exports = Base.Resource = Resource

function Resource(name) {
  if (typeof name !== 'string')
    throw new TypeError('resource name must be a string')

  Base.call(this)
  this.name = name
}

Resource.prototype = Object.create(Base.prototype)

Resource.prototype.type = 'resource'

Resource.prototype.body = function (body) {
  this.opts.body = body
  return this
}

Resource.prototype.render = function () {
  var ctx = this.ctx
  return function (opts, cb) {
    var req = new Request(ctx)

    if (opts && typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }
}
