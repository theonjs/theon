const expect = require('chai').expect
const entities = require('../../lib/entities')

suite('entities', function () {
  test('client', function () {
    var o = new entities.Client('http://localhost')

    expect(o)
      .to.be.instanceof(entities.Entity)
    expect(o)
      .to.have.property('entity')
      .to.be.equal('client')
    expect(o)
      .to.have.property('ctx')
    expect(o)
      .to.have.property('aliases')
      .to.be.an('array')
    expect(o)
      .to.have.property('entities')
      .to.be.an('array')
    expect(o.ctx.opts)
      .to.have.property('rootUrl')
      .to.be.equal('http://localhost')
    expect(o)
      .to.have.property('renderEntity')
      .to.be.a('function')
  })

  test('collection', function () {
    var p = new entities.Client('http://localhost')
    var o = new entities.Collection(p)

    expect(o)
      .to.be.instanceof(entities.Entity)
    expect(o)
      .to.have.property('entity')
      .to.be.equal('collection')
    expect(o)
      .to.have.property('ctx')
    expect(o)
      .to.have.property('aliases')
      .to.be.an('array')
    expect(o)
      .to.have.property('entities')
      .to.be.an('array')
    expect(o)
      .to.have.property('renderEntity')
      .to.be.a('function')
  })

  test('resource', function () {
    var p = new entities.Client('http://localhost')
    var c = new entities.Collection(p)
    var o = new entities.Resource(c)

    expect(o)
      .to.be.instanceof(entities.Entity)
    expect(o)
      .to.have.property('entity')
      .to.be.equal('resource')
    expect(o)
      .to.have.property('ctx')
    expect(o)
      .to.have.property('aliases')
      .to.be.an('array')
    expect(o)
      .to.have.property('entities')
      .to.be.an('array')
    expect(o)
      .to.have.property('renderEntity')
      .to.be.a('function')
  })

  test('mixin', function () {
    var o = new entities.Mixin('test', mixin)
    function mixin () {}

    expect(o)
      .to.be.instanceof(entities.Mixin)
    expect(o)
      .to.have.property('entity')
      .to.be.equal('mixin')
    expect(o)
      .to.have.property('name')
      .to.be.equal('test')
    expect(o)
      .to.have.property('fn')
      .to.be.equal(mixin)
    expect(o)
      .to.have.property('renderEntity')
      .to.be.a('function')
  })

  test('getEntity', function () {
    var cli = new entities.Client('test')
    cli.collection('foo').resource('foo')
    cli.resource('bar')

    expect(cli.getEntity('foo')).to.be.instanceof(entities.Collection)
    expect(cli.getEntity('foo').name).to.be.equal('foo')

    expect(cli.getEntity('bar')).to.be.instanceof(entities.Resource)
    expect(cli.getEntity('bar').name).to.be.equal('bar')

    expect(cli.getEntity('foo').getEntity('foo')).to.be.instanceof(entities.Resource)
    expect(cli.getEntity('foo').getEntity('foo').name).to.be.equal('foo')
  })

  test('getEntity by type', function () {
    var cli = new entities.Client('test')
    cli.collection('foo').resource('foo')
    cli.resource('foo')

    expect(cli.getCollection('foo')).to.be.instanceof(entities.Collection)
    expect(cli.getEntity('foo').name).to.be.equal('foo')

    expect(cli.getResource('foo')).to.be.instanceof(entities.Resource)
    expect(cli.getResource('foo').name).to.be.equal('foo')

    expect(cli.getCollection('foo').getResource('foo')).to.be.instanceof(entities.Resource)
    expect(cli.getCollection('foo').getResource('foo').name).to.be.equal('foo')
  })
})
