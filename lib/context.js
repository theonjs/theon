var agents = require('./agents')
var Store = require('./store')
var Middleware = require('./middleware')
var utils = require('./utils')
var merge = utils.merge

module.exports = Context

function Context(ctx) {
  this.parent = null
  this.body = null

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
  data.path = this.buildPath()
  data.agent = this.agent

  defineProperty(data, 'ctx', this)
  defineProperty(data, 'store', this.store)

  return data
}

Context.prototype.mergeParams = function () {
  var data = {}
  var parent = this.parent ? this.parent.raw() : {}

  Context.fields.forEach(function (name) {
    var merger = name === 'headers' ? mergeHeaders : merge
    data[name] = merger(parent[name], this[name], this.persistent[name])
  }, this)

  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildPath = function () {
  var baseUrl = ''

  if (this.parent) {
    baseUrl += this.parent.buildPath()
  }

  var head = this.opts.basePath || ''
  var tail = this.opts.path || ''

  return baseUrl + head + tail
}

function defineProperty(o, name, value) {
  Object.defineProperty(o, name, {
    value: value,
    enumerable: true
  })
}

function mergeHeaders() {
  return utils.normalize(merge.apply(null, arguments))
}