const nock = require('nock')
const sinon = require('sinon')
const expect = require('chai').expect
const theon = require('..')

suite('theon', function () {
  test('api', function () {
    expect(theon).to.be.a('function')
    expect(theon.engine).to.be.an('object')
    expect(theon.Context).to.be.a('function')
    expect(theon.Dispatcher).to.be.a('function')
    expect(theon.entities.Base).to.be.a('function')
    expect(theon.entities.Client).to.be.a('function')
    expect(theon.entities.Resource).to.be.a('function')
    expect(theon.entities.Collection).to.be.a('function')
    expect(theon.VERSION).to.be.a('string')
  })

  test('client', function (done) {
    var spy = sinon.spy()

    nock('http://localhost')
      .get('/api/users/123')
      .matchHeader('Version', '1.0')
      .reply(200, [{
        id: '123',
        username: 'foo'
      }])

    var client = theon('http://localhost')
      .basePath('/api')
      .set('Version', '1.0')
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
      .action('create')
      .method('POST')
      .mixin('validate', function (opts) {
        spy(opts)
        return opts
      })
      .use(function (req, res, next) {
        spy(req)
        next()
      })

    collection
      .resource('get')
      .alias('find')
      .path('/:id')
      .method('GET')
      .use(function (req, ctx, next) {
        spy(req)
        next()
      })

    var cli = client.render()

    expect(cli.users.create).to.be.a('function')
    expect(cli.users.create.validate).to.be.a('function')

    var opts = {}
    expect(cli.users.create.validate(opts)).to.be.equal(opts)

    cli
      .users
      .get()
      .debug()
      .param('id', 123)
      .type('json')
      .use(function (req, res, next) {
        spy(req)
        next()
      })
      .param('id', 123)
      .end(function (err, res) {
        expect(err).to.be.empty
        expect(spy.args).to.have.length(5)
        expect(res.statusCode).to.be.equal(200)
        expect(res.body[0].id).to.be.equal('123')
        expect(res.body[0].username).to.be.equal('foo')
        done(err)
      })
  })
})
