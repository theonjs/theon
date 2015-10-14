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

    // Debug request/response, if enabled
    if (req.ctx.debug) req.ctx.debug(err, req, res)

    // Resolve the callback
    cb(err, res)
  }

  utils.series(phases, done, this)
  return this
}

Dispatcher.prototype.before = function (req, res, next) {
  this.runPhase('request', req, res, next)
}

Dispatcher.prototype.after = function (req, res, next) {
  this.runPhase('response', req, res, next)
}

Dispatcher.prototype.dial = function (req, res, next) {
  // Compose the full URL
  var url = req.opts.rootUrl || ''
  var path = utils.pathParams(req.path, req.params)
  req.url = url + path

  // Call the HTTP agent adapter
  res.orig = req.ctx.agent(req, res, function (err, res) {
    next(err, req, res)
  })
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  var phases = [
    function middleware(next) {
      this.middleware(phase, req, res, next)
    },
    function validate(res, next) {
      this.validate(phase, req, res, next)
    }
  ]

  function done(err, _res) {
    next(err, req, _res || res)
  }

  utils.series(phases, done, this)
}

Dispatcher.prototype.middleware = function (phase, req, res, next) {
  req.ctx.middleware.run(phase, req, res, function (err, _res) {
    next(err, _res || res)
  })
}

Dispatcher.prototype.validate = function (phase, req, res, next) {
  req.ctx.validator.run(phase, req, res, function (err) {
    next(err)
  })
}

function noop() {}
