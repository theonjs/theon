var Request = require('../request')
var engine = require('../engine')
var Context = require('../context')
var extend = require('../utils').extend

module.exports = Entity

function Entity(name) {
  Request.call(this)
  this.name = name
  this.aliases = []
  this.entities = []
  this.proto = Object.create(null)
}

Entity.prototype = Object.create(Request.prototype)

Entity.prototype.alias = function (name) {
  var aliases = this.aliases
  aliases.push.apply(aliases, arguments)
  return this
}

Entity.prototype.collection = function (collection) {
  if (!(collection instanceof Entity.Collection)) {
    collection = new Entity.Collection(collection)
  }

  return this.addEntity(collection)
}

Entity.prototype.action =
Entity.prototype.resource = function (resource) {
  if (!(resource instanceof Entity.Resource)) {
    resource = new Entity.Resource(resource)
  }

  return this.addEntity(resource)
}

Entity.prototype.mixin =
Entity.prototype.helper = function (name, mixin) {
  if (!(name instanceof Entity.Mixin)) {
    mixin = new Entity.Mixin(name, mixin)
  }

  this.addEntity(mixin)
  return this
}

Entity.prototype.addEntity = function (entity) {
  if (invalidEntity(entity)) {
    throw new TypeError('entity must implement render() method')
  }

  if (entity.useParent) {
    entity.useParent(this)
  }

  this.entities.push(entity)
  return entity
}

Entity.prototype.meta = function (meta) {
  var store = this.ctx.store

  var data = store.get('meta')
  if (data) {
    meta = extend(data, meta)
  }

  store.set('meta', meta)
  return this
}

Entity.prototype.extend = function (prop, value) {
  if (typeof prop === 'string')
    this.proto[prop] = value
  else if (prop === Object(prop))
    extend(this.proto, prop)
  return this
}

Entity.prototype.render = function (client) {
  return new engine.Generator(client || this).render()
}

Entity.prototype.renderAll = function (client) {
  if (this.parent) {
    return this.parent.renderAll(client)
  }
  return this.render(client || this)
}

function invalidEntity(entity) {
  return !entity || typeof entity.render !== 'function'
}
