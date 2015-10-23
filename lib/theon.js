module.exports = theon

/**
 * API factory
 */

function theon(url) {
  return new theon.entities.Client(url)
}

/**
 * Export modules
 */

theon.Request    = require('./request')
theon.Response   = require('./response')
theon.Context    = require('./context')
theon.Store      = require('./store')
theon.Dispatcher = require('./dispatcher')
theon.agents     = require('./agents')
theon.engine     = require('./engine')
theon.entities   = require('./entities')

/**
 * Entities factory
 */

;['Client', 'Resource', 'Collection', 'Mixin'].forEach(function (name) {
  theon[name.toLowerCase()] = function (arg, arg2) {
    return new theon.entities[name](arg, arg2)
  }
})

/**
 * Current version
 */

theon.VERSION = '0.1.4'
