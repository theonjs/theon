const expect = require('chai').expect
const Store = require('../lib/store')

suite('store', function () {
  test('set', function () {
    var store = new Store

    store.set('foo', 'bar')
    expect(store.map.foo).to.be.equal('bar')

    store.set('foo', 123)
    expect(store.map.foo).to.be.equal(123)

    var x = {}
    store.set('foo', x)
    expect(store.map.foo).to.be.equal(x)

    store.set('empty', null)
    expect(store.map.empty).to.be.equal(null)
  })

  test('get', function () {
    var store = new Store

    store.set('foo', 'bar')
    expect(store.get('foo')).to.be.equal('bar')
    expect(store.get('empty')).to.be.undefined

    var x = {}
    store.set('foo', x)
    expect(store.get('foo')).to.be.equal(x)

    store.set('foo', null)
    expect(store.get('foo')).to.be.null
  })

  test('remove', function () {
    var store = new Store

    store.set('foo', 'foo')
    expect(store.get('foo')).to.be.equal('foo')

    store.remove('foo')
    expect(store.get('foo')).to.be.undefined
  })

  test('has', function () {
    var store = new Store
    var parent = new Store
    store.useParent(parent)

    store.set('foo', 'foo')
    expect(store.has('foo')).to.be.true

    store.remove('foo')
    expect(store.has('foo')).to.be.false

    parent.set('foo', 'bar')
    expect(store.has('foo')).to.be.true
  })

  test('useParent', function () {
    var store = new Store
    var parent = new Store
    var topParent = new Store

    parent.useParent(topParent)
    store.useParent(parent)

    topParent.set('foo', 'boo')
    expect(store.get('foo')).to.be.equal('boo')

    parent.set('foo', 'bar')
    expect(store.get('foo')).to.be.equal('bar')
    expect(store.get('empty')).to.be.undefined

    store.set('foo', 'foo')
    expect(store.get('foo')).to.be.equal('foo')

    parent.set('foo', null)
    expect(store.get('foo')).to.be.equal('foo')

    topParent.set('bar', 'foo')
    expect(store.get('bar')).to.be.equal('foo')
  })
})
