var Entity = require('./entity')
var Generator = require('../engine').Generator

module.exports = Entity.Collection = Collection

/**
 * Collection is generic entity designed to host
 * other entities, such as resources, mixins or even other collections.
 *
 * Collection has middleware capabitilies and full HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Collection
 * @extends Entity
 */

function Collection (name) {
  Entity.call(this, name)
}

Collection.prototype = Object.create(Entity.prototype)

/**
 * Exposes current entity constructor.
 *
 * @property {Function} constructor
 */

Collection.prototype.constructor = Collection

/**
 * Identifies the entity type.
 *
 * @property {String} entity
 */

Collection.prototype.entity = 'collection'

/**
 * Uses a custom constructor function for the current entity.
 *
 * @param {Function} fn
 * @return {this}
 * @method useConstructor
 */

Collection.prototype.useConstructor = function (fn) {
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

Collection.prototype.renderEntity = function (client) {
  var self = client || this
  return render(collection, self)

  function collection (opts) {
    var target = {}
    var current = self.clone()

    // Use custom constructor, if defined
    if (current.constructorFn) {
      return current.constructorFn.apply(current, arguments) || render(target, current)
    }

    // Otherwise process arguments as options
    if (opts === Object(opts)) current.options(opts)

    return render(target, current)
  }

  function render (target, client) {
    return new Generator(client)
      .bind(target)
      .render()
  }
}
