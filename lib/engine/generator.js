var Client = require('./client')
var has = require('../utils').has

module.exports = Generator

function Generator(src) {
  this.src = src
  this.target = null
}

Generator.entities = [
  'collections',
  'resources',
  'mixins'
]

Generator.prototype.bind = function (target) {
  this.target = target
  return this
}

Generator.prototype.render = function () {
  var src = this.src

  this.target = this.target
    ? this.target
    : new Client(src)

  Generator.entities.forEach(function (kind) {
    this.src[kind].forEach(this.renderEntity, this)
  }, this)

  return this.target
}

Generator.prototype.renderEntity = function (entity) {
  var name = entity.name
  if (!name) throw new TypeError('Render error: missing entity name')

  var value = entity.render()
  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    this.define(name, value)
  }, this)
}

Generator.prototype.define =  function (name, value) {
  if (has(this.target, name)) throw nameConflict(name)

  Object.defineProperty(this.target, name, {
    enumerable: true,
    configurable: false,
    get: function () { return value },
    set: function () { throw new Error('Cannot overwrite property: ' + name) }
  })
}

function nameConflict(name) {
  return new Error('Name conflict: "' + name + '" is already defined')
}
