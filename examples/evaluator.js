var nock = require('nock')
var theon = require('..')

var client = theon('http://my.api.com')

// Set up mocks
nock('http://my.api.com')
  .get('/api/users/1')
  .reply(404)

nock('http://my.api.com')
  .get('/api/users/2')
  .reply(200, [{
    id: '123',
    username: 'foo'
  }])

var users = client
  .basePath('/api')
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  // Attach a resource level evaluator
  .evaluator(function (req, res, next) {
    if (res.status >= 400) {
      return next(new Error('Invalid status code: ' + res.status))
    }
    next() // otherwise continue
  })

// Render the API
var api = users.renderAll()

// Invalid request
api.users
  .get()
  .param('id', 1)
  .end(function (err, res) {
    console.log('Error:', err)
  })

// Non-intercepted
api.users
  .get()
  .param('id', 2)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })
