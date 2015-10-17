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
  agents.embed = agent
}

exports.add = function (name, agent) {
  agents[name] = agent
}
