var Request = require('../request')
var engine = require('../engine')
var Context = require('../context')

module.exports = Base

function Base(name) {
  this.name = name
  this.parent = null

  this.mixins = []
  this.aliases = []
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

Base.prototype.action =
Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  resource.useParent(this)
  this.resources.push(resource)

  return resource
}

Base.prototype.mixin =
Base.prototype.helper = function (name, mixin) {
  if (!(name instanceof Base.Mixin)) {
    mixin = new Base.Mixin(name, mixin)
  }

  this.mixins.push(mixin)
  return this
}

Base.prototype.render = function (client) {
  return new engine.Generator(client || this).render()
}
