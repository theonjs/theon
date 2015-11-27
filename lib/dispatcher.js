var utils = require('./utils')
var Response = require('./response')

module.exports = Dispatcher

function Dispatcher (req) {
  this.req = req
}

Dispatcher.prototype.run = function (cb) {
  cb = cb || noop

  var ctx = this.req.ctx
  var req = this.req.raw()
  var res = new Response(req)

  function done (err, req, res) {
    var client = this.req

    if (err === 'intercept') err = null

    // Set request context, if not present
    if (!res.req) res.req = req

    // Resolve the callback
    if (!err) return cb(null, res, client)

    // Expose the error
    req.error = err

    // Dispatch the error hook
    ctx.middleware.run('error', req, res, function (_err, _res) {
      cb(_err || err, _res || res, client)
    })
  }

  utils.series([
    function before (next) {
      this.before(req, res, next)
    },
    function dial (req, res, next) {
      this.dial(req, res, next)
    },
    function after (req, res, next) {
      this.after(req, res, next)
    }
  ], done, this)

  return this.req
}

Dispatcher.prototype.before = function (req, res, next) {
  utils.series([
    function before (next) {
      this.runHook('before', req, res, next)
    },
    function request (req, res, next) {
      this.runPhase('request', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.after = function (req, res, next) {
  utils.series([
    function response (next) {
      this.runPhase('response', req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.dial = function (req, res, next) {
  var url = req.opts.rootUrl || ''
  var path = req.ctx.buildPath()
  var fullPath = utils.pathParams(path, req.params)

  if (fullPath instanceof Error) {
    return next(fullPath)
  }

  // Compose the full URL
  req.url = url + fullPath

  utils.series([
    function before (next) {
      this.runMiddleware('before dial', req, res, next)
    },
    this.dialer,
    function after (req, res, next) {
      this.runMiddleware('after dial', req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.dialer = function (req, res, next) {
  var nextFn = utils.once(forward(req, res, next))

  // Call the HTTP agent adapter
  res.orig = req.ctx.agent(req, res, nextFn)

  // Handle writable stream pipes
  if (res.orig && res.orig.pipe) {
    (req.pipes || this.req.pipes || []).forEach(res.orig.pipe.bind(res.orig))
  }

  // Dispatch the dialing observer
  this.runMiddleware('dialing', req, res, onDealing)

  function onDealing (err) {
    if (err && res.orig && typeof res.orig.abort === 'function') {
      nextFn(new Error('Request aborted: ' + (err.message || err)))
      try { res.orig.abort() } catch (e) {}
    }
  }
}

Dispatcher.prototype.runHook = function (event, req, res, next) {
  utils.series([
    function global (next) {
      this.runMiddleware(event, req, res, next)
    },
    function entity (req, res, next) {
      this.runEntity(event, req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.runPhase = function (phase, req, res, next) {
  utils.series([
    function before (next) {
      this.runHook('before ' + phase, req, res, next)
    },
    function middleware (req, res, next) {
      this.runStack('middleware', phase, req, res, next)
    },
    function validate (req, res, next) {
      this.runStack('validator', phase, req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after ' + phase, req, res, next)
    }
  ], next, this)
}

Dispatcher.prototype.runStack = function (stack, phase, req, res, next) {
  var event = stack + ' ' + phase

  utils.series([
    function before (next) {
      this.runHook('before ' + event, req, res, next)
    },
    function run (req, res, next) {
      this.runMiddleware(event, req, res, next)
    },
    function runEntity (req, res, next) {
      this.runEntity(event, req, res, next)
    },
    function after (req, res, next) {
      this.runHook('after ' + event, req, res, next)
    },
  ], next, this)
}

Dispatcher.prototype.runEntity = function (event, req, res, next) {
  if (!req.client) return next(null, req, res)

  var hierarchy = req.client.entityHierarchy
  if (!hierarchy) return next(null, req, res)

  var phase = event + ' ' + hierarchy
  this.runMiddleware(phase, req, res, next)
}

Dispatcher.prototype.runMiddleware = function (event, req, res, next) {
  req.ctx.middleware.run(event, req, res, forward(req, res, next))
}

function forward (req, res, next) {
  return function (err, _res) {
    next(err, req, _res || res)
  }
}

function noop () {}
