const expect = require('chai').expect
const Request = require('../lib/request')

suite('request', function () {
  test('instance', function () {
    var req = new Request
    expect(req.parent).to.be.null
    expect(req.dispatcher).to.be.null
    expect(req.pipes).to.be.an('array')
    expect(req.ctx).to.be.an('object')
    expect(req.root).to.be.equal(req)
  })

  test('path', function () {
    var req = new Request
    req
      .url('http://foo')
      .basePath('/foo')
      .path('/bar')

    expect(req.ctx.opts.rootUrl).to.be.equal('http://foo')
    expect(req.ctx.opts.basePath).to.be.equal('/foo')
    expect(req.ctx.opts.path).to.be.equal('/bar')
  })

  test('method', function () {
    var req = new Request
    req.method('GET')
    expect(req.ctx.method).to.be.equal('GET')
  })

  test('params', function () {
    var req = new Request
    req.param('foo', 'bar')
    expect(req.ctx.params).to.be.deep.equal({foo:'bar'})

    req.params({bar:'foo'})
    expect(req.ctx.params).to.be.deep.equal({
      foo: 'bar',
      bar: 'foo'
    })

    req.unsetParam('foo')
    expect(req.ctx.params).to.be.deep.equal({bar:'foo'})

    req.setParams({})
    expect(req.ctx.params).to.be.deep.equal({})
  })

  test('persistent params', function () {
    var req = new Request
    req.persistParam('foo', 'bar')
    expect(req.ctx.persistent.params).to.be.deep.equal({foo:'bar'})

    req.persistParams({bar:'foo'})
    expect(req.ctx.persistent.params).to.be.deep.equal({
      foo: 'bar',
      bar: 'foo'
    })
  })

  test('query', function () {
    var req = new Request
    req.persistParam('foo', 'bar')
    expect(req.ctx.persistent.params).to.be.deep.equal({foo:'bar'})

    req.persistParams({bar:'foo'})
    expect(req.ctx.persistent.params).to.be.deep.equal({
      foo: 'bar',
      bar: 'foo'
    })
  })
})
