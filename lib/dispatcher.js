module.exports = Dispatcher

function Dispatcher(req) {
  this.req = req
  this.ctx = req.ctx
}

Dispatcher.prototype.run = function (cb) {
  var req = this.ctx.getHttpParams()
  req.url = getUrl(req)

  var ctx = this.ctx
  ctx.mw.request.run(req, ctx, function (err) {
    if (err) return cb(err)
    runValidator(ctx, req, cb)
  })

  function runValidator(ctx, req, cb) {
    ctx.validators.request.run(req, this.ctx, function (err) {
      if (err) return cb(err)
      dispatchRequest(ctx, req, cb)
    })
  }

  function dispatchRequest(ctx, req, cb) {
    ctx.ctx.agent(req, ctx, function (err, res) {
      if (err) return cb(err)
      runResponseMiddleware(ctx, req, res, cb)
    })
  }

  function runResponseMiddleware(ctx, req, res, cb) {
    ctx.mw.response.run(req, res, ctx, function (err) {
      if (err) return cb(err, res, req)
      runResponseValidator(ctx, req, res, cb)
    })
  }

  function runResponseValidator(ctx, req, res, cb) {
    ctx.validators.response.run(req, res, ctx, function (err) {cb(err, res, req)
    })
  }
}

function getUrl(req) {
  var url = req.rootUrl || ''

  if (req.basePath) url += req.basePath
  if (req.path) url += req.path

  return url
}
