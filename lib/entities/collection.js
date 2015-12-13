var Entity = require('./entity')

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
