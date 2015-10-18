module.exports = Response

function Response(req) {
  this.req = req
  this.store = req ? req.store : null
  this.client = req ? req.client : null

  this.orig =
  this.body =
  this.json =
  this.type =
  this.error = null

  this.headers = {}
  this.typeParams = {}

  this.status =
  this.statusType =
  this.statusCode = 0

  this.type =
  this.statusText = ''
}

Response.prototype.setOriginalResponse = function (orig) {
  this.orig = orig
}

Response.prototype.setBody = function (body) {
  this.body = body
  if (~this.type.indexOf('json')) this.json = body
}

Response.prototype.get = function (name) {
  return this.headers[name.toLowerCase()]
}

Response.prototype.setHeaders = function (headers) {
  for (var key in headers) {
    this.headers[key.toLowerCase()] = headers[key]
  }

  var ct = this.headers['content-type']
  if (ct) this.setType(ct)
}

Response.prototype.setType = function (contentType) {
  // content-type
  var ct = contentType || ''
  this.type = type(ct)

  // params
  var obj = params(ct)
  for (var key in obj) this.typeParams[key] = obj[key]
}

Response.prototype.setStatus = function (status) {
  if (status === 1223) status = 204

  var type = status / 100 | 0

  this.statusType = type
  this.status = this.statusCode = status

  this.info = 1 == type
  this.ok = 2 == type
  this.clientError = 4 == type
  this.serverError = 5 == type

  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false

  // sugar
  this.accepted = 202 == status
  this.noContent = 204 == status
  this.badRequest = 400 == status
  this.unauthorized = 401 == status
  this.notAcceptable = 406 == status
  this.notFound = 404 == status
  this.forbidden = 403 == status
}

Response.prototype.setStatusText = function (text) {
  this.statusText = text
}

Response.prototype.toError = function () {
  var req = this.req
  var url = req.url
  var method = req.method
  var status = this.status || this.statusCode

  var msg = 'cannot ' + method + ' ' + url + ' (' + status + ')'
  var err = new Error(msg)
  err.status = status
  err.method = method
  err.url = url

  return err
}

function params(str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */)
    var key = parts.shift()
    var val = parts.shift()
    if (key && val) obj[key] = val
    return obj
  }, {})
}

function type(str) {
  return str.split(/ *; */).shift()
}
