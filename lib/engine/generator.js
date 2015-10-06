var Client = require('./client')

module.exports = Generator

var subentities = ['collections', 'resources']

function Generator(client) {
  this.src = client
  this.client = new Client(client)
}

Generator.prototype.render = function () {
  var src = this.src

  subentities.forEach(function (kind) {
    this.src[kind].forEach(this.renderMembers, this)
  }, this)

  src.mixins.forEach(this.renderMixin, this)

  return this.client
}

Generator.prototype.renderMixin = function (mixin) {
  var client = this.client
  var name = mixin.name

  if (client.hasOwnProperty(name))
    throw new Error('Name conflict: ' + name + ' is already in use')

  client[name] = mixin.mixin
}

Generator.prototype.renderMembers = function (entity) {
  var client = this.client
  var name = entity.name

  if (!name)
    throw new TypeError('Render error: missing entity name')

  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    if (client.hasOwnProperty(name))
      throw new Error('Name conflict: "' + name + '" is already defined')

    Object.defineProperty(client, name, {
      enumerable: true,
      configurable: false,
      get: function () {
        return entity.render()
      },
      set: function () {
        throw new Error('Cannot override the property')
      }
    })
  })
}
