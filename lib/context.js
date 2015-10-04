var mw = require('midware')
var utils = require('./utils')
var agents = require('./agents')

module.exports = Context

function Context(ctx) {
  this.body = null
  this.parent = null

  this.body = null
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

Context.prototype.get = function () {
  var parent = {}
  var opts = this.opts

  if (this.parent) parent = this.parent.get()

  var basePath = parent.basePath || ''
  var data = utils.merge(parent, opts)
  data.basePath = basePath + (opts.basePath || '')

  data.headers = utils.merge(parent.headers, this.headers)
  data.query = utils.merge(parent.query, this.query)
  data.params = utils.merge(parent.params, this.params)
  data.cookies = utils.merge(parent.cookies, this.cookies)
  data.agentOpts = utils.merge(parent.agentOpts, this.agentOpts)

  data.ctx = this

  return data
}

Context.prototype.buildUrl = function (ctx) {
  var params = ctx.params
  var head = ctx.basePath || ''
  var tail = ctx.path || ''
  var path = utils.pathParams(head + tail, params)
  return ctx.rootUrl + path
}
