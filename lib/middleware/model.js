module.exports = function bindModel (model) {
  if (typeof model !== 'function')
    throw new TypeError('model must be a function')

  return function (req, res, next) {
    var body = res.body
    if (body) res.model = model(body, req, res)
    next()
  }
}
