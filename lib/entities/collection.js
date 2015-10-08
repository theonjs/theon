var Base = require('./base')

module.exports = Base.Collection = Collection

function Collection(name) {
  Base.call(this, name)
}

Collection.prototype = Object.create(Base.prototype)

Collection.prototype.entity = 'collection'
