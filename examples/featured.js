var nock = require('nock')
var theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123')
  .matchHeader('Version', '1.0')
  .reply(200, [{
    id: '123',
    username: 'foo'
  }])

// First, we must build a new client
var client = theon('http://my.api.com')
  .basePath('/api')
  .set('Version', '1.0')
  .use(function (req, res, next) {
    // Global HTTP middleware
    next()
  })

// Attach a new collection
var collection = client
  .collection('users')
  .basePath('/users')
  .use(function (req, res, next) {
    // Collection specific HTTP middleware
    next()
  })

// Attach a new resource to that collection
collection
  .resource('get')
  .alias('find')
  .path('/:id')
  .method('GET')
  .use(function (req, res, next) {
    // Resource specific middleware
    next()
  })

// Render the API
var api = client.render()

api
  .users
  .get()
  .param('id', 123)
  .type('json')
  .use(function (req, res, next) {
    // Request phase specific middleware
    next()
  })
  .param('id', 123)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
    console.log('Body:', res.body)
  })
