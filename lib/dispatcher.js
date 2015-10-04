module.exports = Dispatcher

var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

function Dispatcher(ctx) {
  this.ctx = ctx
}

Dispatcher.prototype.run = function (cb) {
  var ctx = this.ctx
  var req = ctx.get()
  cb = cb || noop

  // Define path
  var path = (req.basePath || '') + (req.path || '')
  while ((res = PATH_REGEXP.exec(path)) != null) {
    var param = res[3]
    if (param && !req.params[param]) {
      throw new Error('Missing required path param: ' + param)
    }
    path = path.replace(':' + param, req.params[param])
  }

  req.url = req.rootUrl + path

  ctx.mw.request.run(req, {}, function (err) {
    if (err) return cb(err)
    runValidator(ctx, req, cb)
  })

  function runValidator(ctx, req, cb) {
    ctx.validators.request.run(req, {}, function (err) {
      if (err) return cb(err)
      dispatchRequest(ctx, req, cb)
    })
  }

  function dispatchRequest(ctx, req, cb) {
    ctx.agent(req, ctx, function (err, res) {
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
    ctx.validators.response.run(req, res, ctx, function (err) {
      cb(err, res, req)
    })
  }
}

function noop() {}
