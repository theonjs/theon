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

Collection.prototype.entity = 'collection'

Collection.prototype.constructor = Collection

Collection.prototype.useConstructor = function (fn) {
  if (typeof fn === 'function') this.constructorFn = fn
  return this
}

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
