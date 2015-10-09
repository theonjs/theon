var agents = require('./agents')
var Validator = require('./validator')
var Middleware = require('./middleware')
var merge = require('./utils').merge

module.exports = Context

function Context(ctx) {
  this.parent = null
  this.body = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}

  this.agentOpts = null
  this.agent = agents.defaults()

  this.validator = new Validator
  this.middleware = new Middleware

  if (ctx) this.useParent(ctx)
}

Context.prototype.useParent = function (ctx) {
  this.parent = ctx
  this.setupMiddleware(ctx)
  return this
}

Context.prototype.setupMiddleware = function (parent) {
  ['middleware', 'validator'].forEach(function (key) {
    ['request', 'response'].forEach(function (phase) {
      this[key].use(phase, function (req, res, next) {
        parent[key].run(phase, req, res, next)
      })
    }, this)
  }, this)
}

Context.prototype.get =
Context.prototype.raw = function () {
  var parent = this.parent
    ? this.parent.get()
    : {}

  var data = {}
  data.opts = merge(parent.opts, this.opts)
  data.path = this.buildPath()

  data.headers = merge(parent.headers, this.headers)
  data.query = merge(parent.query, this.query)
  data.params = merge(parent.params, this.params)
  data.cookies = merge(parent.cookies, this.cookies)

  data.agent = this.agent
  data.agentOpts = merge(parent.agentOpts, this.agentOpts)

  data.ctx = this
  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildPath = function () {
  var baseUrl = ''

  if (this.parent)
    baseUrl += this.parent.buildPath()

  var head = this.opts.basePath || ''
  var tail = this.opts.path || ''

  return baseUrl + head + tail
}
