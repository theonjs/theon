var Entity = require('./entity')

module.exports = Client

/**
 * Client implements a top level HTTP entity designed
 * to host other child entities, such as Collections, Resources, Mixins or event other Clients.
 * providing a middleware capable interface and HTTP DSL.
 *
 * @param {String} url - Optional base URL.
 * @constructor
 * @class Client
 * @extends Entity
 */

function Client (url) {
  Entity.call(this)
  if (url) this.url(url)
}

Client.prototype = Object.create(Entity.prototype)

Client.prototype.constructor = Client

Client.prototype.entity = 'client'
