const nock = require('nock')
const sinon = require('sinon')
const expect = require('chai').expect
const theon = require('..')

suite('theon', function () {
  test('api', function () {
    expect(theon).to.be.a('function')
    expect(theon.Base).to.be.a('function')
    expect(theon.VERSION).to.be.a('string')
  })

  test('client', function (done) {
    var spy = sinon.spy()

    var client = theon('http://localhost')
      .basePath('/api')
      .use(function (req, ctx, next) {
        spy(req)
        next()
      })

    var collection = client
      .collection('users')
      .basePath('/users')
      .use(function (req, ctx, next) {
        spy(req)
        next()
      })

    collection
      .resource('get')
      .alias('find')
      .method('GET')
      .use(function (req, ctx, next) {
        spy(req)
        next()
      })

    nock('http://localhost')
      .get('/api/users/123')
      .reply(200, [{
        id: '123',
        username: 'foo'
      }])

    client.render()
      .users
      .get()
      .path('/123')
      .param('id', 123)
      .end(function (err, res) {
        expect(err).to.be.empty
        expect(spy.calledThrice).to.be.true
        expect(res.statusCode).to.be.equal(200)
        expect(res.body[0].id).to.be.equal('123')
        expect(res.body[0].username).to.be.equal('foo')
        done(err)
      })
  })
})
