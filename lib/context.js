var Middleware = require('midware-pool')
var agents = require('./agents')
var Store = require('./store')
var utils = require('./utils')

module.exports = Context

function Context(ctx) {
  this.body =
  this.stream =
  this.method =
  this.parent = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}
  this.persistent = {}

  this.agentOpts = {}
  this.agent = agents.defaults()

  this.store = new Store
  this.middleware = new Middleware

  if (ctx) this.useParent(ctx)
}

Context.fields = [
  'opts',
  'headers',
  'query',
  'params',
  'cookies',
  'agentOpts'
]

Context.prototype.useParent = function (parent) {
  this.parent = parent

  ;['middleware', 'store'].forEach(function (key) {
    this[key].useParent(parent[key])
  }, this)

  return this
}

Context.prototype.raw = function () {
  var data = this.mergeParams()
  data.agent = this.agent

  // Expose needed members
  data.ctx = this
  data.store = this.store

  // Set defaults
  if (!data.method) data.method = 'GET'

  return data
}

Context.prototype.mergeParams = function () {
  var data = {}
  var parent = this.parent ? this.parent.raw() : {}

  ;['method', 'body', 'stream'].forEach(function (name) {
    data[name] = this[name] || parent[name] || null
  }, this)

  Context.fields.forEach(function (name) {
    var merger = name === 'headers' ? mergeHeaders : utils.merge
    data[name] = merger(parent[name], this[name], this.persistent[name])
  }, this)

  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildPath = function () {
  return Context.buildPath(this)
}

Context.buildPath = function buildPath(ctx) {
  var base = ''

  if (ctx.parent) {
    base += buildPath(ctx.parent)
  }

  var opts = ctx.opts
  var head = opts.basePath || ''
  var tail = opts.path || ''

  return base + head + tail
}

function mergeHeaders() {
  return utils.normalize(utils.merge.apply(null, arguments))
}
