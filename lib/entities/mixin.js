var Base = require('./base')

module.exports = Base.Mixin = Mixin

function Mixin(name, fn) {
  if (typeof fn !== 'function')
    throw new TypeError('mixin must be a function')

  this.fn = fn
  this.name = name
  this.ctx = null
}

Mixin.prototype.entity = 'mixin'

Mixin.prototype.useContext = function (ctx) {
  this.ctx = ctx
}

Mixin.prototype.render = function () {
  var fn = this.fn
  var ctx = this.ctx

  return function mixin() {
    return fn.apply(ctx, arguments)
  }
}
