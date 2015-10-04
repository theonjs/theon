module.exports = Builder

function Builder(client) {
  this.parent = client
  this.client = new Client(client)
}

Builder.prototype.render = function () {
  var parent = this.parent

  ;['collections', 'resources', 'methods'].forEach(function (kind) {
    parent[kind].forEach(this.renderMembers, this)
  }, this)

  return this.client
}

Builder.prototype.renderMembers = function (entity) {
  var client = this.client
  var name = entity.name

  if (!name)
    throw new TypeError('Render error: missing entity name')

  var names = [ name ].concat(entity.aliases)

  names.forEach(function (name) {
    if (client.hasOwnProperty(name))
      throw new Error('Name conflict: "' + name + '" is already defined')

    Object.defineProperty(client, name, {
      enumerable: true,
      configurable: false,
      get: function () {
        return entity.render()
      },
      set: function () {
        throw new Error('Cannot override the property')
      }
    })
  })
}

// to do: isolate
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
