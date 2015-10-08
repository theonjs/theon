var mw = require('midware')
var utils = require('./utils')
var agents = require('./agents')

module.exports = Context

function Context(ctx) {
  this.body =
  this.parent = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}

  this.agentOpts = null
  this.agent = agents.defaults()

  this.mw = {
    request: mw(this),
    response: mw(this)
  }

  this.validators = {
    request: mw(this),
    response: mw(this)
  }

  if (ctx) this.useParent(ctx)
}

Context.prototype.useParent = function (ctx) {
  this.parent = ctx
  this.setupMiddleware(ctx)
  return this
}

Context.prototype.setupMiddleware = function (parent) {
  var self = this
  ;['mw', 'validators'].forEach(function (key) {
    ['request', 'response'].forEach(function (phase) {
      self[key][phase](function () {
        parent[key][phase].run.apply(self, arguments)
      })
    })
  })
}

Context.prototype.get =
Context.prototype.raw = function () {
  var parent = this.parent
    ? this.parent.get()
    : { opts: {} }

  var basePath = parent.opts.basePath || ''

  var data = {}
  data.opts = utils.merge(parent.opts, this.opts)

  data.headers = utils.merge(parent.headers, this.headers)
  data.query = utils.merge(parent.query, this.query)
  data.params = utils.merge(parent.params, this.params)
  data.cookies = utils.merge(parent.cookies, this.cookies)

  data.agent = this.agent
  data.agentOpts = utils.merge(parent.agentOpts, this.agentOpts)

  data.ctx = this
  return data
}

Context.prototype.clone = function () {
  var ctx = new Context
  return ctx.useParent(this)
}

Context.prototype.buildUrl = function () {
  var baseUrl = ''
  var opts = this.opts

  if (this.parent) {
    baseUrl += this.parent.buildUrl()
  } else {
    baseUrl += opts.rootUrl || ''
  }

  var head = opts.basePath || ''
  var tail = opts.path || ''

  return baseUrl + head + tail
}
