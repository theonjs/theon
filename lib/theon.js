module.exports = Theon

/**
 * Creates a new Theon API client
 *
 * @param {String} url
 * @return {Client}
 * @class Theon
 */

function Theon (url) {
  return new Theon.entities.Client(url)
}

/**
 * Export HTTP request abstraction
 * @property {Request} Request
 * @static
 */

Theon.Request = require('./request')

/**
 * Export HTTP response abstraction
 * @property {Response} Response
 * @static
 */

Theon.Response = require('./response')

/**
 * Export context module
 * @property {Context} Context
 * @static
 */

Theon.Context = require('./context')

/**
 * Export store module
 * @property {Store} Store
 * @static
 */

Theon.Store = require('./store')

/**
 * Export traffic dispatcher module
 * @property {Dispatcher} Dispatcher
 * @static
 */

Theon.Dispatcher = require('./dispatcher')

/**
 * Export HTTP agents module
 * @property {Object} agents
 * @static
 */

Theon.agents = require('./agents')

/**
 * Export engine modules
 * @property {Object} engine
 * @static
 */

Theon.engine = require('./engine')

/**
 * Export built-in entities constructors
 * @property {Object} agents
 * @static
 */

Theon.entities = require('./entities')

/**
 * Creates a new client entity
 * @param {String} url
 * @method client
 * @return {Client}
 * @static
 */

/**
 * Creates a new resource entity
 * @param {String} name
 * @method resource
 * @return {Resource}
 * @static
 */

/**
 * Creates a new collection entity
 * @param {String} name
 * @method collection
 * @return {Collection}
 * @static
 */

/**
 * Creates a new mixin entity
 * @param {String} url
 * @method mixin
 * @return {Mixin}
 * @static
 */

;['Client', 'Resource', 'Collection', 'Mixin'].forEach(function (name) {
  Theon[name.toLowerCase()] = function (arg, arg2) {
    return new Theon.entities[name](arg, arg2)
  }
})

/**
 * Current library version
 * @property {String} VERSION
 * @static
 */

Theon.VERSION = '0.1.9'
