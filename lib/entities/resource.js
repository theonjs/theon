var Entity = require('./entity')
var Request = require('../request')
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

function Resource (name) {
  Entity.call(this, name)
}

Resource.prototype = Object.create(Entity.prototype)

Resource.prototype.entity = 'resource'

Resource.prototype.renderEntity = function () {
  var self = this

  return new Generator(this)
    .bind(resource)
    .render()

  function resource (opts, cb) {
    var req = new Request()
    req.useParent(self)

    if (opts === Object(opts)) req.options(opts)
    if (typeof opts === 'function') cb = opts

    return typeof cb === 'function'
      ? req.end(cb)
      : req
  }
}
