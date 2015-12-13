var Entity = require('./entity')

module.exports = Entity.Mixin = Mixin

function Mixin (name, fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('mixin must be a function')
  }

  Entity.call(this, name)
  this.fn = fn
}

Mixin.prototype = Object.create(Entity.prototype)

Mixin.prototype.entity = 'mixin'

Mixin.prototype.renderEntity = function () {
  var self = this
  return function () {
    return self.fn.apply(self, arguments)
  }
}

Mixin.prototype.mixin =
Mixin.prototype.helper =
Mixin.prototype.action =
Mixin.prototype.resource =
Mixin.prototype.collection =
Mixin.prototype.getMixin =
Mixin.prototype.getClient =
Mixin.prototype.getEntity =
Mixin.prototype.getResource =
Mixin.prototype.getCollection = function () {
  throw new Error('not implemented')
}
