var Entity = require('./entity')

module.exports = Entity.Mixin = Mixin

function Mixin (name, fn) {
  if (typeof fn !== 'function')
    throw new TypeError('mixin must be a function')

  this.fn = fn
  this.name = name
  this.ctx = null
}

Mixin.prototype.entity = 'mixin'

Mixin.prototype.useParent = function (ctx) {
  this.ctx = ctx
}

Mixin.prototype.renderEntity = function () {
  var fn = this.fn
  return function () {
    var ctx = this ? this._client || this : this
    return fn.apply(ctx, arguments)
  }
}
