var utils = require('./utils')
var Response = require('./response')

module.exports = Dispatcher

function Dispatcher(req) {
  this.req = req
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var ctx = this.req.ctx
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

    // Resolve the callback
    if (!err) return cb(null, res)

    req.error = err
    ctx.observer.run('error', req, res, resolver)

    function resolver(_err, _res) {
      cb(_err || err, _res || res)
    }
  }

  utils.series(phases, done, this)
  return this
}

Dispatcher.prototype.before = function (req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before', req, res, next)
    },
    function request(req, res, next) {
      this.runPhase('request', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.after = function (req, res, next) {
  utils.series([
    function response(next) {
      this.runPhase('response', req, res, next)
    },
    function after(req, res, next) {
      this.runHook('after', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.dial = function (req, res, next) {
  // Compose the full URL
  var url = req.opts.rootUrl || ''
  var path = utils.pathParams(req.path, req.params)
  req.url = url + path

  utils.series([
    function before(next) {
      req.ctx.observer.run('before dial', req, res, forward(req, res, next))
    },
    function dial(req, res, next) {
      res.orig = req.ctx.agent(req, res, forward(req, res, next))
    },
    function after(req, res, next) {
      req.ctx.observer.run('after dial', req, res, forward(req, res, next))
    }
  ], next, this)
}

Dispatcher.prototype.runHook = function (event, req, res, next) {
  req.ctx.observer.run(event, req, res, forward(req, res, next))
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before ' + phase, req, res, next)
    },
    function middleware(req, res, next) {
      this.runStack('middleware', phase, req, res, next)
    },
    function validate(req, res, next) {
      this.runStack('validator', phase, req, res, next)
    },
    function after(req, res, next) {
      this.runHook('after ' + phase, req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.runStack = function (stack, phase, req, res, next) {
  utils.series([
    function before(next) {
      this.runHook('before ' + stack + ' ' + phase, req, res, next)
    },
    function request(req, res, next) {
      req.ctx[stack].run(phase, req, res, forward(req, res, next))
    },
    function after(req, res, next) {
      this.runHook('after ' + stack + ' ' + phase, req, res, next)
    },
  ], next, this)
}

function forward(req, res, next) {
  return function (err, _res) {
    next(err, req, _res || res)
  }
}

function noop() {}
