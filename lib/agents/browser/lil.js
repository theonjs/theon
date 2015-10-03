module.exports = function (opts, ctx, done) {
  var client = require('lil-http')
  return client(ctx, done)
}
