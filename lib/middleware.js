var mw = require('midware')

module.exports = Middleware

function Middleware() {
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

Middleware.prototype.run = function (phase, req, res, next) {
  var stack = this.stack[phase]
  if (!stack) return next()
  this.eval(stack, req, res, next)
}

Middleware.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, next)
}
