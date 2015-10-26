const expect = require('chai').expect
const model = require('../../lib/middleware').model

suite('model', function () {
  test('bind model', function () {
    function bindModel(body, req, res) {
      return { get: function () { return body }}
    }

    var res = { body: { hello: 'world' }}
    model(bindModel)(null, res, assert)

    function assert(err) {
      expect(err).to.be.undefined
      expect(res.model.get()).to.be.deep.equal({
        hello: 'world'
      })
    }
  })
})
