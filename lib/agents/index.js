var isBrowser = typeof window !== 'undefined'

var agents = exports.agents = isBrowser
  ? require('./browser')
  : require('./node')

exports.get = function (name) {
  return name
    ? agents[name]
    : agents.embed
}

exports.defaults = function () {
  return exports.get()
}

exports.set = function (agent) {
  exports.add('embed', agent)
}

exports.add = function (name, agent) {
  if (typeof name !== 'string')
    throw new TypeError('first argument must be a string')
  if (typeof agent !== 'function')
    throw new TypeError('agent must be a function')

  agents[name] = agent
}

exports.remove = function (name) {
  delete agents[name]
}
