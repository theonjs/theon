module.exports = Builder

function Builder(client) {
  this.client = client
}

Builder.prototype.render = function () {
  var client = this.client

  function BaseClient(client) {
    this.client = client
  }

  var proto = BaseClient.prototype

  proto._doRequest = function (opts, cb) {

  }

  ;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].forEach(function (method) {
    proto[method] = function () {
      return this._doRequest(method)
    }
  })

  client.collections.forEach(renderMembers)
  client.resources.forEach(renderMembers)
  client.methods.forEach(renderMembers)

  function renderMembers(node) {
    var name = node.name

    if (!name)
      throw new TypeError('Cannot render: missing name')

    var names = [ name ].concat(node.aliases)

    names.forEach(function (name) {
      if (proto[name])
        throw new Error('Name conflict: "' + name + '" is already in use')

      function getter() {
        return node.render()
      }

      Object.defineProperty(proto, name, {
        get: getter,
        enumerable: true,
        configurable: true
      })
    })
  }

  return new BaseClient(client)
}
