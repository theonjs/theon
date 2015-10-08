var Middleware = require('./middleware')

module.exports = Validator

function Validator() {
  Middleware.call(this)
}

Validator.prototype = Object.create(Middleware.prototype)

Validator.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, function (err) { next(err) })
}
