const expect = require('chai').expect
const map = require('../../lib/middleware').map

suite('map', function () {
  test('simple map', function () {
    function mapper (body, next) {
      next(null, {
        salutation: 'Hello ' + body.hello
      })
    }

    var res = { body: { hello: 'world' }}
    map(mapper)(null, res, assert)

    function assert (err) {
      expect(err).to.be.undefined
      expect(res.body).to.be.deep.equal({
        salutation: 'Hello world'
      })
    }
  })

  test('empty body', function () {
    var res = {}
    map(assert)(null, res, assert)

    function assert (err) {
      expect(err).to.be.undefined
      expect(res.body).to.be.undefined
    }
  })
})
