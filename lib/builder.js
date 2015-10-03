module.exports = Builder

function Builder(ctx) {
  this.ctx = ctx
  this.client = null
}

Builder.prototype.render = function () {
  var ctx = this.ctx

  function BaseClient(ctx) {
    this.ctx = ctx
  }

  var proto = BaseClient.prototype

  proto._doRequest = function (opts, cb) {

  }

  ;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].forEach(function (method) {
    proto[method] = function () {
      return this._doRequest(method)
    }
  })

  ctx.collections.forEach(renderMembers)
  ctx.resources.forEach(renderMembers)
  ctx.methods.forEach(renderMembers)

  function renderMembers(node) {
    var name = node.name

    if (!name)
      throw new TypeError('Cannot render, missing name')

    var names = [ name ].concat(node.aliases)

    names.forEach(function (name) {
      if (proto[name])
        throw new Error('Name conflict: "' + name + '" is already in use')

      function getter() {
        if (node.type === 'resource') {
          return node.render()
        }
        return node.render()
      }

      Object.defineProperty(proto, name, {
        get: getter,
        enumerable: true,
        configurable: true
      })
    })
  }

  return new BaseClient(ctx)
}
