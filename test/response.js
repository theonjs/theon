const expect = require('chai').expect
const Response = require('../lib/response')

suite('response', function () {
  test('instance', function () {
    var res = new Response

    expect(res.body).to.be.null
    expect(res.headers).to.be.deep.equal({})
    expect(res.typeParams).to.be.deep.equal({})
    expect(res.status).to.be.equal(0)
    expect(res.statusType).to.be.equal(0)
    expect(res.statusCode).to.be.equal(0)
    expect(res.type).to.be.equal('')
    expect(res.statusText).to.be.equal('')
  })

  test('setBody', function () {
    var body = {foo: 'bar'}
    var res = new Response()
    res.setBody(body)
    expect(res.body).to.be.equal(body)
  })

  test('setOriginalResponse', function () {
    var orig = {}
    var res = new Response()
    res.setOriginalResponse(orig)
    expect(res.orig).to.be.equal(orig)
  })

  test('setHeaders', function () {
    var headers = { Foo: 'bar' }
    var res = new Response
    res.setHeaders(headers)
    expect(res.headers).to.be.deep.equal({foo: 'bar'})
  })

  test('get', function () {
    var body = {Foo: 'bar'}
    var res = new Response()
    res.setHeaders(body)
    expect(res.get('foo')).to.be.equal('bar')
  })

  test('setType', function () {
    var res = new Response
    res.setType('application/json; encoding=utf8')
    expect(res.type).to.be.equal('application/json')
    expect(res.typeParams).to.be.deep.equal({encoding: 'utf8'})
  })

  test('setStatus', function () {
    var res = new Response({ method: 'GET' })

    res.setStatus(200)
    expect(res.status).to.be.equal(200)
    expect(res.statusType).to.be.equal(2)
    expect(res.error).to.be.false
    expect(res.ok).to.be.true
    expect(res.clientError).to.be.false
    expect(res.serverError).to.be.false

    res.setStatus(400)
    expect(res.status).to.be.equal(400)
    expect(res.statusType).to.be.equal(4)
    expect(res.badRequest).to.be.true
    expect(res.clientError).to.be.true
    expect(res.serverError).to.be.false
    expect(res.error).to.be.instanceof(Error)

    res.setStatus(500)
    expect(res.status).to.be.equal(500)
    expect(res.statusType).to.be.equal(5)
    expect(res.clientError).to.be.false
    expect(res.serverError).to.be.true
    expect(res.error).to.be.instanceof(Error)
  })

  test('setStatusText', function () {
    var res = new Response
    res.setStatusText('OK')
    expect(res.statusText).to.be.equal('OK')
  })

  test('toError', function () {
    var req = { url: 'http://foo', method: 'GET' }
    var res = new Response(req)
    res.setStatus(500)

    expect(res.toError())
      .to.be.instanceof(Error)
      .to.have.property('message')
      .to.be.equal('cannot GET http://foo (500)')
  })
})
