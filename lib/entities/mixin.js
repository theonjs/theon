var Base = require('./base')

module.exports = Base.Mixin = Mixin

function Mixin(name, fn) {
  if (typeof fn !== 'function')
    throw new TypeError('mixin must be a function')

  this.name = name
  this.fn = fn
}

Mixin.prototype.entity = 'mixin'

Mixin.prototype.render = function () {
  var fn = this.fn
  return function mixin() {
    return fn.apply(this, arguments)
  }
}
