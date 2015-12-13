module.exports = Response

/**
 * Response provides a generic, abstract, consistent and simple DSL interface
 * with additional sintax sugar to deal effectively with HTTP response
 * fields via a read/write API that is consumed by both agent adapters and end users.
 *
 * Since theon is HTTP agent agnostic, agent adapter implementors
 * should know about the Response write API in order to provide a
 * consistent behavior and data to higher layer.
 *
 * @param {Request} req - Outgoing request.
 * @constructor
 * @class Response
 */

function Response (req) {
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
  Object.keys(headers).forEach(function (key) {
    this.headers[key.toLowerCase()] = headers[key]
  }, this)

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

  this.info = type === 1
  this.ok = type === 2
  this.clientError = type === 4
  this.serverError = type === 5

  this.error = (type === 4 || type === 5)
    ? this.toError()
    : false

  // sugar
  this.accepted = status === 202
  this.noContent = status === 204
  this.badRequest = status === 400
  this.unauthorized = status === 401
  this.notAcceptable = status === 406
  this.notFound = status === 404
  this.forbidden = status === 403
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

function params (str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */)
    var key = parts.shift()
    var val = parts.shift()
    if (key && val) obj[key] = val
    return obj
  }, {})
}

function type (str) {
  return str.split(/ *; */).shift()
}
