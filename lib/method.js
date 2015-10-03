var Base = require('./base')

module.exports = Base.Method = Method

function Method(name, path) {
  this.name = name
}

Method.prototype = Object.create(Base.prototype)

Method.prototype.path = function (path) {
  this.path = path
}
