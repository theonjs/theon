const sinon = require('sinon')
const expect = require('chai').expect
const Dispatcher = require('../lib/dispatcher')

suite('dispatcher', function () {
  test('run', function (done) {
    var spy = sinon.spy()

    function agentStub(req, res, next) {
      res.setStatus(200)
      next(null, res)
    }

    var rawStub = {
      opts: { rootUrl: 'http://foo' },
      ctx: {
        agent: agentStub,
        buildPath: function () {
          return ''
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
})
