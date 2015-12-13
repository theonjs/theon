var engine = require('../engine')
var Request = require('../http/request')
var extend = require('../utils').extend

module.exports = Entity

function Entity (name) {
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
  return this.addEntity(mixin)
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

Entity.prototype.getCollection = function (name) {
  return this.getEntity(name, 'collection')
}

Entity.prototype.getResource = function (name) {
  return this.getEntity(name, 'resource')
}

Entity.prototype.getMixin = function (name) {
  return this.getEntity(name, 'mixin')
}

Entity.prototype.getClient = function (name) {
  return this.getEntity(name, 'client')
}

Entity.prototype.getEntity = function (name, type) {
  return this.entities.reduce(function (match, entity) {
    if (match) return match
    if (entity.name === name && (!type || (entity.entity === type))) {
      return entity
    }
    return null
  }, null)
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
  if (typeof prop === 'string') this.proto[prop] = value
  else if (prop === Object(prop)) extend(this.proto, prop)
  return this
}

Entity.prototype.render = function (client) {
  if (this.parent) {
    return this.parent.render(client)
  }
  return this.renderEntity(client)
}

Entity.prototype.renderEntity = function (client) {
  return new engine.Generator(client || this).render()
}

function invalidEntity (entity) {
  return !entity || typeof entity.renderEntity !== 'function'
}
