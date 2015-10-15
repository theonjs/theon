var mw = require('midware')

module.exports = Middleware

function Middleware() {
  this.parent = null
  this.stack = Object.create(null)
}

Middleware.prototype.use = function (phase, fn) {
  var stack = this.stack[phase]

  if (!stack) {
    stack = this.stack[phase] = mw()
  }

  stack(fn)
  return this
}

Middleware.prototype.useParent = function (parent) {
  this.parent = parent
}

Middleware.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, next)
}

Middleware.prototype.run = function (phase, req, res, next) {
  var eval = this.eval
  var stack = this.stack[phase]

  if (this.parent) {
    return this.parent.run(phase, req, res, handler)
  }

  run()

  function handler(err, res) {
    if (err) return next(err)
    if (res) return next(null, res)
    run()
  }

  function run() {
    if (!stack) return next()
    eval(stack, req, res, next)
  }
}
