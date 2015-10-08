var isBrowser = typeof window !== 'undefined'
var agents = null

if (isBrowser) {
  agents = {
    embed: require('./browser/lil')
  }
} else {
  agents = {
    embed: require('./node/request')
  }
}

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

