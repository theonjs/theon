var Entity = require('./entity')
var Request = require('../http/request')
var Generator = require('../engine').Generator

module.exports = Entity.Resource = Resource

/**
 * Resource is a simple entity designed to be attached
 * to concrete HTTP resources, such as an API endpoint.
 *
 * Resource has middleware capabitilies and full HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Resource
 * @extends Entity
 */

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
