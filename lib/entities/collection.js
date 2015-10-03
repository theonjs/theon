var Base = require('../base')

module.exports = Collection

function Collection(name) {
  if (typeof name !== 'string')
    throw new TypeError('collection name must be a string')

  Base.call(this)
  this.name = name
  this.client = null
  this.resources = []
}

Collection.prototype = Object.create(Base.prototype)
