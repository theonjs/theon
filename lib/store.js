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

/**
 * Get value looking by key in parent stores.
 *
 * @param {String} key
 * @return {Mixed}
 * @method getParent
 */

Store.prototype.getParent = function (key) {
  if (this.parent) return this.parent.get(key)
}

/**
 * Get value looking by key in current and parent stores.
 *
 * @param {String} key
 * @return {Mixed}
 * @method get
 */

Store.prototype.get = function (key) {
  var value = this.map[key]
  if (value !== undefined) return value
  return this.getParent(key)
}

/**
 * Set a value by key in current store.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Mixed}
 * @method set
 */

Store.prototype.set = function (key, value) {
  if (key) this.map[key] = value
}

/**
 * Set a value by key in the parent store.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Mixed}
 * @method setParent
 */

Store.prototype.setParent = function (key, value) {
  if (this.parent) this.parent.set(key, value)
}

/**
 * Attaches a new parent store.
 *
 * @param {Store} parent
 * @method useParent
 */

Store.prototype.useParent = function (parent) {
  this.parent = parent
}

/**
 * Removes a key and value in the current store.
 *
 * @param {String} key
 * @method remove
 */

Store.prototype.remove = function (key) {
  this.map[key] = undefined
}

/**
 * Checks if the given key exists in current and parent stores.
 *
 * @param {String} key
 * @return {Boolean}
 * @method has
 */

Store.prototype.has = function (key) {
  return this.get(key) !== undefined
}
