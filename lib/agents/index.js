var isBrowser = typeof window !== 'undefined'

exports.browser = {
  embed: require('./browser/lil')
}

exports.node = {
  embed: require('./node/request')
}

var agents = isBrowser
  ? exports.browser
  : exports.node

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
