var Entity =  require('./entity')
var Request = require('../request')
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

function Resource(name) {
  Entity.call(this, name)
}

Resource.prototype = Object.create(Entity.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.render = function () {
  var self = this

  return new Generator(this)
    .bind(resource)
    .render()

  function resource(opts, cb) {
    var req = new Request
    req.useParent(self)

    if (typeof opts === 'object')
      req.options(opts)

    if (typeof opts === 'function')
      cb = opts

    if (typeof cb === 'function')
      return req.end(cb)

    return req
  }
}
