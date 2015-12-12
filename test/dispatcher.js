const sinon = require('sinon')
const expect = require('chai').expect
const Dispatcher = require('../lib/dispatcher')

suite('dispatcher', function () {
  test('instance', function () {
    var req = {}
    var dis = new Dispatcher(req)
    expect(dis.req).to.be.equal(req)
  })

  test('run', function (done) {
    var spy = sinon.spy()

    var rawStub = {
      opts: { rootUrl: 'http://foo' },
      ctx: {
        agent: agentStub,
        buildPath: function () {
          return ''
        },
        renderParams: function (req) {
          return req.params
        },
        middleware: {
          run: function (phase, req, res, next) {
            spy(phase)
            next()
          }
        }
      }
    }

    var reqStub = {
      raw: function () {
        return rawStub
      }
    }

    var dis = new Dispatcher(reqStub)
    expect(dis.req).to.be.equal(reqStub)

    dis.run(function (err, res) {
      expect(err).to.be.null
      expect(res.req.url).to.be.equal('http://foo')
      expect(res.statusCode).to.be.equal(200)
      expect(spy.args).to.be.have.length(20)
      done()
    })
  })

  test('params as functions', function (done) {
    var ctx = {
      agent: agentStub,
      buildPath: function () {
        return '/:id/:action'
      },
      renderParams: function (req) {
        req.params.action = req.params.action(req)
        return req.params
      },
      middleware: {
        run: function (phase, req, res, next) {
          next()
        }
      }
    }

    var params = {
      id: 123,
      action: function (req) {
        return req.params.id + req.params.id
      }
    }

    var rawStub = {
      opts: { rootUrl: 'http://foo' },
      params: params,
      ctx: ctx
    }

    var reqStub = {
      raw: function () {
        return rawStub
      }
    }

    var dis = new Dispatcher(reqStub)
    dis.run(function (err, res) {
      expect(err).to.be.null
      expect(res.req.url).to.be.equal('http://foo/123/246')
      expect(res.statusCode).to.be.equal(200)
      done()
    })
  })
})

function agentStub (req, res, next) {
  res.setStatus(200)
  next(null, res)
}
