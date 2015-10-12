var Entity =  require('./entity')

module.exports = Client

function Client(url) {
  Entity.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Entity.prototype)

Client.prototype.entity = 'client'
