const expect = require('chai').expect
const Request = require('../../lib/http/request')
const Client = require('../../lib/engine').Client

suite('client', function () {
  var stub = { ctx: { agent: fakeAgent } }

  function fakeAgent (req, res, cb) {
    res.statusCode = 200
    cb(null, res)
  }

  test('doRequest', function (done) {
    var cli = new Client(stub)
    cli.doRequest({ method: 'GET' }, assert)

    function assert (err, res) {
      expect(err).to.be.null
      expect(res.statusCode).to.be.equal(200)
      expect(res.req.method).to.be.equal('GET')
      done()
    }
  })

  test('newRequest', function (done) {
    var request = new Request()
    var cli = new Client(request)
    var req = cli.newRequest()
    req.ctx.agent = stub.ctx.agent
    req.end(assert)

    function assert (err, res) {
      expect(err).to.be.null
      expect(res.statusCode).to.be.equal(200)
      expect(res.req.method).to.be.equal('GET')
      done()
    }
  })

  test('methods', function (done) {
    var cli = new Client(stub)
    var count = 0
    var methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS']

    methods.forEach(function (method) {
      cli[method]({ url: 'http://foo' }, assert(method))
    })

    function assert (method) {
      return function (err, res) {
        count += 1
        expect(err).to.be.null
        expect(res.statusCode).to.be.equal(200)
        expect(res.req.method).to.be.equal(method)
        if (count === methods.length) done()
      }
    }
  })

  test('delegate api methods', function () {
    var cli = new Client(stub)
    var methods = ['use', 'plugin', 'observe', 'useResponse']

    methods.forEach(function (method) {
      expect(cli[method]).to.be.a('function')
    })
  })
})
