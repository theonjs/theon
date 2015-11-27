var Entity = require('./entity')

module.exports = Entity.Collection = Collection

function Collection (name) {
  Entity.call(this, name)
}

Collection.prototype = Object.create(Entity.prototype)

Collection.prototype.entity = 'collection'
