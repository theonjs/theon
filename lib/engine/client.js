module.exports = Client

function Client(client) {
  this._client = client
}

Client.prototype._doRequest = function (method, args) {
  // to do
}

;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS'].forEach(function (method) {
  Client.prototype[method] = function () {
    return this._doRequest(method, arguments)
  }
})
