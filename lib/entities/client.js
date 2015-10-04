var Base = require('../base')

module.exports = Client

function Client(url) {
  Base.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Base.prototype)

Client.prototype.entity = 'client'
