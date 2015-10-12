var Request = require('../request')
var engine = require('../engine')
var Context = require('../context')

module.exports = Base

function Base(name) {
  this.name = name
  this.parent = null
  this.aliases = []
  this.entities = []
  this.ctx = new Context
}

Base.prototype = Object.create(Request.prototype)

Base.prototype.alias = function (name) {
  var aliases = this.aliases
  aliases.push.apply(aliases, arguments)
  return this
}

Base.prototype.collection = function (collection) {
  if (!(collection instanceof Base.Collection)) {
    collection = new Base.Collection(collection)
  }

  return this.addEntity(collection)
}

Base.prototype.action =
Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  return this.addEntity(resource)
}

Base.prototype.mixin =
Base.prototype.helper = function (name, mixin) {
  if (!(name instanceof Base.Mixin)) {
    mixin = new Base.Mixin(name, mixin)
  }

  this.addEntity(mixin)
  return this
}

Base.prototype.addEntity = function (entity) {
  if (invalidEntity(entity)) {
    throw new TypeError('entity must implement render() method')
  }

  if (entity.useParent) {
    entity.useParent(this)
  }

  this.entities.push(entity)
  return entity
}

Base.prototype.render = function (client) {
  return new engine.Generator(client || this).render()
}

function invalidEntity(entity) {
  return !entity || typeof entity.render !== 'function'
}
