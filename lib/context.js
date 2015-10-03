var agents = require('./agents')

module.exports = Context

function Context() {
  this.body = null
  this.parent = null

  this.opts = {}
  this.query = {}
  this.params = {}
  this.headers = {}
  this.cookies = {}

  this.agentOpts = null
  this.agent = agents.defaults()
}

Context.prototype.useParent = function (ctx) {
  this.parent = ctx
}
