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
theon.Context    = require('./context')
theon.Dispatcher = require('./dispatcher')
theon.agents     = require('./agents')
theon.engine     = require('./engine')
theon.entities   = require('./entities')
theon.utils      = require('./utils')

/**
 * Current version
 */

theon.VERSION = '0.1.0'
