var nock = require('nock')
var theon = require('..')

var client = theon('http://my.api.com')

// Set up mocks
nock('http://my.api.com')
  .get('/api/users/1')
  .reply(200, [{
    id: '123',
    username: 'foo'
  }])

var users = client
  .type('json')
  .basePath('/api')
  .collection('users')
  .basePath('/users')
  .mixin('get', function (id, cb) {
    // Create a new request which inherits from
    // the current collection scope to make a custom request
    var req = this.newRequest()
    req.path('/:id')
    req.param('id', 1)
    req.end(cb)
  })
  // You can also plug in middleware to the mixin scope
  .use(function (req, res, next) {
    console.log('URL:', req.opts.rootUrl)
    next()
  })
  // Map body response for the current mixin function
  .map(function (body, next) {
    body = body.shift()
    next(null, body)
  })

// Render the API
var api = users.render()

// Test mixin
api.users
  .get('id', function (err, res) {
    console.log('Response:', res.statusCode, res.body)
  })
