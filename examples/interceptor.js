var nock = require('nock')
var theon = require('..')

nock('http://my.api.com')
  .get('/api/users/99')
  .reply(200, { username: 'foo', id: 99 })

var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  // Attach a resource level interceptor
  .interceptor(function (req, res, next) {
    // Determine if we should interceptor the request
    if (req.params.id > 100) {
      res.setStatus(400)
      res.setStatusText('Bad Request')
      res.setBody({ error: 'Invalid user ID' })
      // We must pass an custom string to notify we intercepted the request
      return next('intercept')
    }

    next() // otherwise continue
  })

// Render the API
var api = users.render()

// Intercepted request
api.users
  .get()
  .param('id', 101)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })

// Non-intercepted
api.users
  .get()
  .param('id', 99)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })
