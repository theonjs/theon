var Base = require('./base')
var Request = require('../request')

module.exports = Base.Resource = Resource

function Resource(name) {
  Base.call(this)
  this.name = name
}

Resource.prototype = Object.create(Base.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.render = function () {
  var ctx = this.ctx
  var req = new Request(ctx)

  return function (opts, cb) {
    if (typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }
}
