module.exports = function lower (str) {
  return typeof str === 'string'
    ? str.toLowerCase()
    : ''
}
