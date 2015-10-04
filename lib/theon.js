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
theon.Builder    = require('./builder')
theon.entities   = require('./entities')
theon.Dispatcher = require('./dispatcher')

/**
 * Current version
 */

theon.VERSION = '0.1.0'
