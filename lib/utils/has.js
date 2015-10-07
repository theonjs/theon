var hasOwn = Object.prototype.hasOwnProperty

module.exports = function (o, name) {
  return !!o && hasOwn.call(o, name)
}
