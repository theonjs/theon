var mw = require('midware')
var Base = require('./base')
var Collection = require('./collection')

module.exports = Client

function Client(url) {
  Base.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Base.prototype)
