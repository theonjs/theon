var Client = require('./client')

module.exports = Generator

var entities = ['collections', 'resources', 'mixins']

function Generator(src) {
  this.src = src
  this.target = null
}

Generator.prototype.bind = function (target) {
  this.target = target
  return this
}

Generator.prototype.render = function () {
  var src = this.src

  this.target = this.target
    ? this.target
    : new Client(src)

  entities.forEach(function (kind) {
    this.src[kind].forEach(this.renderEntity, this)
  }, this)

  return this.target
}

Generator.prototype.renderEntity = function (entity) {
  var target = this.target
  var name = entity.name

  if (!name) throw new TypeError('Render error: missing entity name')

  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    if (target.hasOwnProperty(name)) throw nameConflict(name)

    var entityClient = entity.render()

    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: false,
      get: function () {
        return entityClient
      },
      set: function () {
        throw new Error('Cannot override the property')
      }
    })
  })
}

function nameConflict(name) {
  return new Error('Name conflict: "' + name + '" is already defined')
}
