module.exports = function has (o, name) {
  return !!o && Object.prototype.hasOwnProperty.call(o, name)
}
