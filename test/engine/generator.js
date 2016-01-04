const expect = require('chai').expect
const Client = require('../../lib/engine').Client
const Generator = require('../../lib/engine').Generator

suite('generator', function () {
  function EntityStub (name) {
    return {
      name: name,
      aliases: [ name + name ],
      decorators: [],
      renderEntity: function () {
        return name
      }
    }
  }

  test('render', function () {
    var src = {
      entities: [
        new EntityStub('foo'),
        new EntityStub('bar')
      ]
    }

    var gen = new Generator(src)

    var target = gen.render()
    expect(target).to.be.instanceof(Client)
    expect(target).to.have.property('foo').to.be.equal('foo')
    expect(target).to.have.property('foofoo').to.be.equal('foo')
    expect(target).to.have.property('bar').to.be.equal('bar')
    expect(target).to.have.property('barbar').to.be.equal('bar')
    expect(target).to.have.property('doRequest').to.be.a('function')
    expect(target).to.have.property('newRequest').to.be.a('function')
    expect(target).to.have.property('GET').to.be.a('function')
  })

  test('render with custom target', function () {
    var target = {}
    var src = {
      entities: [
        new EntityStub('foo'),
        new EntityStub('bar')
      ]
    }

    var gen = new Generator(src)
    gen.bind(target)

    var tar = gen.render()
    expect(tar).to.be.equal(target)
    expect(tar).to.have.property('foo').to.be.equal('foo')
    expect(tar).to.have.property('foofoo').to.be.equal('foo')
    expect(tar).to.have.property('bar').to.be.equal('bar')
    expect(tar).to.have.property('barbar').to.be.equal('bar')
    expect(target).to.not.have.property('doRequest')
  })

  test('render name conflict', function () {
    var src = {
      entities: [
        new EntityStub('foo'),
        new EntityStub('foo')
      ]
    }

    expect(function () {
      new Generator(src).render()
    })
      .to.throw(Error)
      .to.match(/Name conflict/)
      .to.match(/\"foo\" property is already defined$/)
  })

  test('render with decorators', function () {
    var entityFoo = new EntityStub('foo')
    entityFoo.decorators = [
      function (delegate) {
        return delegate + '1'
      },
      function (delegate) {
        return delegate + '2'
      }
    ]

    var target = {}
    var src = { entities: [ entityFoo ] }

    var gen = new Generator(src)
    gen.bind(target)

    var tar = gen.render()
    expect(tar).to.be.equal(target)
    expect(tar).to.have.property('foo').to.be.equal('foo12')
    expect(tar).to.have.property('foofoo').to.be.equal('foo12')
  })
})
