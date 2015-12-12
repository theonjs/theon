const expect = require('chai').expect
const Context = require('../lib/context')

suite('context', function () {
  var emptyProps = ['body', 'stream', 'method', 'parent']
  var props = ['query', 'opts', 'params', 'headers', 'cookies', 'persistent', 'agentOpts']

  test('instance', function () {
    var ctx = new Context()
    expect(ctx.agent).to.be.a('function')

    emptyProps.forEach(function (key) {
      expect(ctx)
        .to.have.property(key)
        .to.be.null
    })

    props.forEach(function (key) {
      expect(ctx)
        .to.have.property(key)
        .to.be.an('object')
    })
  })

  test('raw', function () {
    var ctx = new Context()
    var raw = ctx.raw()

    expect(raw.method).to.be.equal('GET')
    expect(raw.agent).to.be.a('function')
    expect(raw.ctx).to.be.an('object')
    expect(raw.store).to.be.an('object')
  })

  test('parent inheritance', function () {
    var parent = new Context()
    parent.method = 'POST'
    parent.headers = { foo: 'bar' }

    var ctx = new Context(parent)
    expect(ctx).to.have.property('parent').to.be.equal(parent)

    var raw = ctx.raw()
    expect(raw.method).to.be.equal('POST')
    expect(raw.agent).to.be.a('function')
    expect(raw.ctx).to.be.an('object')
    expect(raw.store).to.be.an('object')
    expect(raw.headers).to.be.deep.equal({foo: 'bar'})
  })

  test('clone', function () {
    var parent = new Context()
    parent.method = 'POST'
    parent.headers = { foo: 'bar' }

    var ctx = new Context(parent)
    expect(ctx).to.have.property('parent').to.be.equal(parent)

    var clone = ctx.clone()
    expect(clone).to.not.equal(ctx)
    expect(clone.headers).to.not.equal(ctx.headers)
    expect(clone.parent).to.be.equal(ctx)

    var raw = clone.raw()
    expect(raw.method).to.be.equal('POST')
    expect(raw.agent).to.be.a('function')
    expect(raw.ctx).to.be.an('object')
    expect(raw.store).to.be.an('object')
    expect(raw.headers).to.be.deep.equal({foo: 'bar'})
  })

  test('buildPath', function () {
    var parent = new Context()
    parent.opts.basePath = '/foo'

    var ctx = new Context(parent)
    ctx.opts.path = '/bar'
    expect(ctx).to.have.property('parent').to.be.equal(parent)

    var path = ctx.buildPath()
    expect(path).to.be.equal('/foo/bar')
  })

  test('renderParams', function () {
    var ctx = new Context()

    var params = {
      id: 123,
      name: function (_ctx, req) {
        expect(_ctx).to.be.equal(ctx)
        expect(req).to.be.equal(reqStub)
        return req.params.id + req.params.id
      }
    }

    var reqStub = {
      params: params
    }

    var pasedParams = ctx.renderParams(reqStub)
    expect(pasedParams).to.be.deep.equal({
      id: 123,
      name: 246
    })
  })
})
