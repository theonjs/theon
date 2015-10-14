var hasOwn = Object.prototype.hasOwnProperty

module.exports = function has(o, name) {
  return !!o && hasOwn.call(o, name)
}
