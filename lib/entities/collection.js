var Base = require('./base')

module.exports = Base.Collection = Collection

function Collection(name) {
  Base.call(this)
  this.name = name
}

Collection.prototype = Object.create(Base.prototype)

Collection.prototype.entity = 'collection'
