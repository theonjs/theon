var utils = require('./utils')
var Response = require('./response')

module.exports = Dispatcher

function Dispatcher(req) {
  this.req = req
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var req = this.req.raw()
  var res = new Response(this.req)

  var phases = [
    function before(next) {
      this.before(req, res, next)
    },
    function dial(req, res, next) {
      this.dial(req, res, next)
    },
    function after(req, res, next) {
      this.after(req, res, next)
    }
  ]

  function done(err, req, res) {
    if (err === 'intercept') err = null
    if (req.ctx.debug) req.ctx.debug(err, req, res)
    cb(err, res)
  }

  utils.series(phases, done, this)
  return this
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  var ctx = req.ctx

  var phases = [
    function middleware(next) {
      ctx.mw[phase].run(req, res, forward(next))
    },
    function validate(res, next) {
      ctx.validators[phase].run(req, res, forward(next))
    }
  ]

  function forward(next) {
    return function (err, _res) {
      next(err, _res || res)
    }
  }

  function done(err, res) {
    next(err, req, res)
  }

  utils.series(phases, done, this)
}

Dispatcher.prototype.before = function (req, res, next) {
  this.runPhase('request', req, res, next)
}

Dispatcher.prototype.after = function (req, res, next) {
  this.runPhase('response', req, res, next)
}

Dispatcher.prototype.dial = function (req, res, next) {
  // Render URL with params
  req.url = utils.pathParams(req.url, req.params)

  res.orig = req.ctx.agent(req, res, function (err, res) {
    next(err, req, res)
  })
}

function noop() {}
