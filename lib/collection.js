var Base = require('./base')

module.exports = Base.Collection = Collection

function Collection(name) {
  if (typeof name !== 'string')
    throw new TypeError('collection name must be a string')

  Base.call(this)
  this.name = name
}

Collection.prototype = Object.create(Base.prototype)

Collection.prototype.type = 'collection'
