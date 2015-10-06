var Response = require('./response')
var series = require('./utils').series

module.exports = Dispatcher

function Dispatcher(ctx) {
  this.ctx = ctx
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var req = this.ctx.get()
  var res = new Response(req)

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
    cb(err, res)
  }

  series(phases, done, this)
  return this
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  var ctx = req.ctx

  ctx.mw[phase].run(req, res, function (err, _res) {
    if (err) return next(err, req, _res || res)

    ctx.validators[phase].run(req, res, function (err, _res) {
      next(err, req, _res || res)
    })
  })
}

Dispatcher.prototype.before = function (req, res, next) {
  this.runPhase('request', req, res, next)
}

Dispatcher.prototype.after = function (req, res, next) {
  this.runPhase('response', req, res, next)
}

Dispatcher.prototype.dial = function (req, res, next) {
  // Build full URL
  req.url = req.ctx.buildUrl(req)

  req.ctx.agent(req, res, function (err, res) {
    next(err, req, res)
  })
}

function noop() {}
