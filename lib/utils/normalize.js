module.exports = function normalize(o) {
  var buf = {}
  Object.keys(o || {}).forEach(function (name) {
    buf[name.toLowerCase()] = o[name]
  })
  return buf
}
