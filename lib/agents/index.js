var isBrowser = typeof window !== 'undefined' && !!window

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

exports.add = function (name, agent) {
  agents[name] = agent
}
