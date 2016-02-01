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

/**
 * Exposes current entity constructor.
 *
 * @property {Function} constructor
 */

Resource.prototype.constructor = Resource

/**
 * Identifies the entity type.
 *
 * @property {String} entity
 */

Resource.prototype.entity = 'resource'

/**
 * Uses a custom constructor function for the current entity.
 *
 * @param {Function} fn
 * @return {this}
 * @method useConstructor
 */

Resource.prototype.useConstructor = function (fn) {
  if (typeof fn === 'function') this.constructorFn = fn
  return this
}

/**
 * Renders the current entity, optionally passing a theon Client instance.
 * This method is mostly used internally.
 *
 * @param {Client} client
 * @return {Function}
 * @method renderEntity
 */

Resource.prototype.renderEntity = function (client) {
  var self = client || this

  return new Generator(this)
    .bind(resource)
    .render()

  function resource (opts, cb) {
    var req = new Request()
    req.useParent(self)

    // If has custom constructor, use it
    if (self.constructorFn) {
      return self.constructorFn.apply(req, arguments) || req
    }

    // Otherwise process arguments as options
    if (opts === Object(opts)) req.options(opts)
    if (typeof opts === 'function') cb = opts

    return typeof cb === 'function'
      ? req.end(cb)
      : req
  }
}
