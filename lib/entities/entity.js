var Base = require('../base')
var engine = require('../engine')
var Request = require('../http/request')
var extend = require('../utils').extend

module.exports = Entity

/**
 * Entity provides a generic abstract interface designed
 * that's inherited by top-level entities in order to provide
 * convenient methods to extend entities with child entities
 * and some additional helpers.
 *
 * Extends from Request, then it provides middleware
 * capabilities and HTTP DSL.
 *
 * @param {String} name - Optional entity name.
 * @constructor
 * @class Entity
 * @extends Request
 */

function Entity (name) {
  Request.call(this)
  this.name = name
  this.aliases = []
  this.entities = []
  this.decorators = []
  this.proto = Object.create(null)
}

Entity.prototype = Object.create(Request.prototype)

/**
 * Enumerate property accessors to avoid to the cloned.
 *
 * @property {Array} accessors
 * @static
 */

Entity.accessors = Base.accessors.concat('parent')

/**
 * Exposes current entity constructor.
 *
 * @property {Function} constructor
 */

Entity.prototype.constructor = Entity

/**
 * Defines an entity alias by name.
 *
 * @param {String} name
 * @return {this}
 * @method alias
 */

Entity.prototype.alias = function (name) {
  var aliases = this.aliases
  aliases.push.apply(aliases, arguments)
  return this
}

/**
 * Attaches a child collection to the current entity.
 *
 * @param {Collection|String} collection
 * @return {Collection}
 * @method collection
 */

Entity.prototype.collection = function (collection) {
  if (!(collection instanceof Entity.Collection)) {
    collection = new Entity.Collection(collection)
  }
  return this.addEntity(collection)
}

/**
 * Attaches a child resource to the current entity.
 *
 * @param {Resource|String} resource
 * @return {Resource}
 * @method action
 * @alias resource
 */

Entity.prototype.action =
Entity.prototype.resource = function (resource) {
  if (!(resource instanceof Entity.Resource)) {
    resource = new Entity.Resource(resource)
  }
  return this.addEntity(resource)
}

/**
 * Attaches a child mixin to the current entity.
 *
 * @param {String|Mixin} name
 * @param {Function} resource
 * @return {Mixin}
 * @method mixin
 * @alias helper
 */

Entity.prototype.mixin =
Entity.prototype.helper = function (name, mixin) {
  if (!(name instanceof Entity.Mixin)) {
    mixin = new Entity.Mixin(name, mixin)
  }
  return this.addEntity(mixin)
}

/**
 * Registers a new entity instance as child entity.
 *
 * @param {Entity} entity
 * @return {Entity}
 * @method addEntity
 * @protected
 */

Entity.prototype.addEntity = function (entity) {
  if (invalidEntity(entity)) {
    throw new TypeError('entity must implement render() method')
  }

  if (entity.useParent) {
    entity.useParent(this)
  }

  var existentEntity = this.getEntity(entity.name, entity.entity)
  if (existentEntity) return existentEntity

  this.entities.push(entity)
  return entity
}

/**
 * Finds a collection type entity as child entities in the current entity.
 *
 * @param {String} name
 * @return {Entity}
 * @method getCollection
 * @alias findCollection
 */

Entity.prototype.getCollection =
Entity.prototype.findCollection = function (name) {
  return this.getEntity(name, 'collection')
}

/**
 * Finds a resource type entity as child entities in the current entity.
 *
 * @param {String} name
 * @return {Entity}
 * @method getResource
 * @alias getAction
 * @alias findResource
 */

Entity.prototype.getAction =
Entity.prototype.getResource =
Entity.prototype.findResource = function (name) {
  return this.getEntity(name, 'resource')
}

/**
 * Finds a mixin type entity as child entities in the current entity.
 *
 * @param {String} name
 * @return {Entity}
 * @method getMixin
 * @alias findMixin
 */

Entity.prototype.getMixin =
Entity.prototype.findMixin = function (name) {
  return this.getEntity(name, 'mixin')
}

/**
 * Finds a client type entity as child entities in the current entity.
 *
 * @param {String} name
 * @return {Entity}
 * @method getClient
 * @alias findClient
 */

Entity.prototype.getClient =
Entity.prototype.findClient = function (name) {
  return this.getEntity(name, 'client')
}

/**
 * Finds an entity as child entities in the current entity.
 *
 * @param {String} name
 * @return {Entity}
 * @method getEntity
 * @alias findEntity
 */

Entity.prototype.getEntity =
Entity.prototype.findEntity = function (name, type) {
  return this.entities.reduce(function (match, entity) {
    if (match) return match
    if (entity.name === name && (!type || (entity.entity === type))) {
      return entity
    }
    return null
  }, null)
}

/**
 * Custom constructor should be implemented by top-level entities.
 *
 * @method useConstructor
 * @throws {Error}
 */

Entity.prototype.useConstructor = function () {
  throw new Error('Method only implemented for resource and collection entities')
}

/**
 * Decorate current entity constructor.
 *
 * @param {Function} decorator
 * @return {this}
 * @method decorate
 * @alias decorator
 */

Entity.prototype.decorate =
Entity.prototype.decorator = function (decorator) {
  if (typeof decorator === 'function') {
    this.decorators.push(decorator)
  }
  return this
}

/**
 * Attaches meta data to the current entity.
 * Designed for future use cases and documentation purposes.
 *
 * @param {Object} meta
 * @return {this}
 * @method meta
 */

Entity.prototype.meta = function (meta) {
  var store = this.ctx.store

  var data = store.get('meta')
  if (data) {
    meta = extend(data, meta)
  }

  store.set('meta', meta)
  return this
}

/**
 * Extend entity custom prototype chain.
 * Useful for composition and behavior extensibility by API developers.
 *
 * @param {String|Object} prop
 * @param {Mixed} value
 * @return {this}
 * @method extend
 */

Entity.prototype.extend = function (prop, value) {
  if (typeof prop === 'string') this.proto[prop] = value
  else if (prop === Object(prop)) extend(this.proto, prop)
  return this
}

/**
 * Renders the current and parent entities.
 * This method is used internally.
 *
 * @param {Client} client
 * @return {Entity}
 * @method render
 * @protected
 */

Entity.prototype.render = function (client) {
  if (this.parent) {
    return this.parent.render(client)
  }
  return this.renderEntity(client)
}

/**
 * Renders the current entity and its child entities.
 * This method is used internally.
 *
 * @param {Client} client
 * @return {Entity}
 * @method render
 * @protected
 */

Entity.prototype.renderEntity = function (client) {
  return new engine.Generator(client || this).render()
}

/**
 * Clone the current entity, saving its context and configuration data.
 *
 * @return {Collection}
 * @method clone
 * @protected
 */

Entity.prototype.clone = function () {
  var entity = new this.constructor(this.name)
  entity.useParent(this.parent)

  Object.keys(this)
  .filter(function (key) {
    return !~Entity.accessors.indexOf(key)
  })
  .forEach(function (key) {
    entity[key] = this[key]
  }, this)

  entity.ctx = this.ctx.clone()
  return entity
}

function invalidEntity (entity) {
  return !entity || typeof entity.renderEntity !== 'function'
}
