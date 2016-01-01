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

Theon.Request = require('./http/request')

/**
 * Export HTTP response abstraction
 * @property {Response} Response
 * @static
 */

Theon.Response = require('./http/response')

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
 * Base client interface shared across all the entities,
 * providing the middleware layer and convenient helper methods
 * @property {Store} Store
 * @static
 */

Theon.Base = require('./base')

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
 * @memberof {Theon}
 * @static
 */

/**
 * Creates a new resource entity
 * @param {String} name
 * @method resource
 * @return {Resource}
 * @memberof {Theon}
 * @static
 */

/**
 * Creates a new collection entity
 * @param {String} name
 * @method collection
 * @return {Collection}
 * @memberof {Theon}
 * @static
 */

/**
 * Creates a new mixin entity
 * @param {String} url
 * @method mixin
 * @return {Mixin}
 * @memberof {Theon}
 * @static
 */

Object.keys(Theon.entities).forEach(function (name) {
  Theon[name.toLowerCase()] = function (x, y) {
    return new Theon.entities[name](x, y)
  }
})

/**
 * Current library version
 * @property {String} VERSION
 * @static
 */

Theon.VERSION = '0.1.24'

/**
 * Force to define a max stack trace
 * @memberof Error
 * @static
 * @ignore
 */

Error.stackTraceLimit = 10
