var Client = require('./client')

module.exports = theon

/**
 * API factory
 */

function theon(opts) {
  return new Client(opts)
}

/**
 * Export modules
 */

theon.Base     = require('./base')
theon.Client   = require('./client')
theon.Client   = require('./client')
theon.Resource = require('./resource')

/**
 * Current version
 */

theon.VERSION = '0.1.0'
