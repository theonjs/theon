var Request = require('../request')
var Builder = require('../builder')
var Context = require('../context')

module.exports = Base

function Base() {
  this.name = null
  this.parent = null

  this.aliases = []
  this.methods = []
  this.resources = []
  this.collections = []

  this.ctx = new Context
}

Base.prototype = Object.create(Request.prototype)

/**
 * Attach entities
 */

Base.prototype.alias = function (name) {
  this.aliases.push(name)
  return this
}

Base.prototype.collection = function (collection) {
  if (!(collection instanceof Base.Collection)) {
    collection = new Base.Collection(collection)
  }

  collection.useParent(this)
  this.collections.push(collection)

  return collection
}

Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  resource.useParent(this)
  this.resources.push(resource)

  return resource
}

Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  resource.useParent(this)
  this.resources.push(resource)

  return resource
}

Base.prototype.render = function (client) {
  return new Builder(client || this).render()
}
