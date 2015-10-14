var Middleware = require('./middleware')

module.exports = Observer

function Observer() {
  Middleware.call(this)
}

Observer.prototype = Object.create(Middleware.prototype)

Observer.prototype.eval = function (stack, req, res, next) {
  stack.run(req, res, function (err, res) {
    next(err, _res || res)
  })
}
