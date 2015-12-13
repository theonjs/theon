module.exports = Store

/**
 * Store implements a simple hierarhical polymorfic data store,
 * also providing a convenient and handy interface to deal with stored data.
 *
 * @param {Store} store - Optional parent store.
 * @constructor
 * @class Store
 */

function Store (store) {
  this.parent = store
  this.map = Object.create(null)
}

Store.prototype.getParent = function (key) {
  if (this.parent) return this.parent.get(key)
}

Store.prototype.get = function (key) {
  var value = this.map[key]
  if (value !== undefined) return value
  return this.getParent(key)
}

Store.prototype.set = function (key, value) {
  if (key) this.map[key] = value
}

Store.prototype.setParent = function (key, value) {
  if (this.parent) this.parent.set(key, value)
}

Store.prototype.useParent = function (parent) {
  this.parent = parent
}

Store.prototype.remove = function (key) {
  this.map[key] = undefined
}

Store.prototype.has = function (key) {
  return this.get(key) !== undefined
}
