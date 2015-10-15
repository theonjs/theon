var Entity =  require('./entity')
var Request = require('../request')
var extend = require('../utils').extend
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

function Resource(name) {
  this.metadata = {}
  Entity.call(this, name)
}

Resource.prototype = Object.create(Entity.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.meta = function (meta) {
  extend(this.metadata, meta)
  return this
}

Resource.prototype.render = function () {
  var req = new Request
  req.useParent(this)

  return new Generator(this)
    .bind(resource)
    .render()

  function resource(opts, cb) {
    if (typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }
}
