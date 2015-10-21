const expect = require('chai').expect
const Entity = require('../../lib/entities').Entity

suite('entity', function () {
  test('interface', function () {
    var e = new Entity('test')
    expect(e.name).to.be.equal('test')
    expect(e.aliases).to.be.deep.equal([])
    expect(e.entities).to.be.deep.equal([])
    expect(e.proto).to.be.deep.equal({})
  })

  test('attach entities', function () {
    var e = new Entity('test')

    e.alias('foo')
    expect(e.aliases).to.be.deep.equal(['foo'])

    e.collection('collection')
    expect(e.entities[0]).to.have.property('name').to.be.equal('collection')

    e.resource('resource')
    expect(e.entities[1]).to.have.property('name').to.be.equal('resource')

    e.mixin('mixin', function () {})
    expect(e.entities[2]).to.have.property('name').to.be.equal('mixin')
  })

  test('meta', function () {
    var e = new Entity('test')
    var meta = { name: 'test', format: 'json' }
    e.meta(meta)
    expect(e.ctx.store.get('meta')).to.be.deep.equal(meta)
  })

  test('render', function () {
    var e = new Entity('test')
    var o = e.render()
    expect(o).to.be.an('object')
    expect(o._client).to.be.equal(e)
  })

  test('renderAll', function () {
    var c = new Entity('child')
    var e = new Entity('test')
    e.addEntity(c)

    var o = c.render()
    expect(o).to.be.an('object')
    expect(o._client).to.be.equal(e)
  })

  test('inheritance', function () {
    var x = new Entity('subchild')
    var y = new Entity('child')
    var z = new Entity('root')
    y.addEntity(x)
    z.addEntity(y)

    var o = z.render()
    expect(o).to.be.an('object')
    expect(o._client).to.be.equal(z)
    expect(o.child).to.be.an('object')
    expect(o.child._client).to.be.equal(y)
    expect(o.child.subchild).to.be.an('object')
  })

  test('extend', function () {
    var y = new Entity('child')
    var z = new Entity('root')
    z.addEntity(y)
    z.extend('foo', 'bar')

    var o = z.render()
    expect(o).to.be.an('object')
    expect(o._client).to.be.equal(z)
    expect(o.foo).to.be.equal('bar')
    expect(o.child).to.be.an('object')
  })
})
