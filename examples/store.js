var nock = require('nock')
var theon = require('..')

nock('http://my.api.com')
  .post('/auth/signup', { username: 'foo', password: 'b@r' })
  .reply(200, { token: '123456789' })

nock('http://my.api.com')
  .get('/protected')
  .matchHeader('Authorization', '123456789')
  .reply(200, { foo: 'bar' })

var client = theon('http://my.api.com')

var auth = client
  .type('json')
  .collection('auth')
  .basePath('/auth')
  .method('POST')

// Maps to POST /api/auth/signup
auth
  .action('signup')
  .path('/signup')
  // Every time a new user is created successfully
  // we store the session and set the auth header for future requests
  .useResponse(function (req, res, next) {
    // Store the response for future use
    req.root.store.set('session', res.body)
    // Set token for autentication to all the outgoing requests
    req.root.persistHeader('Authorization', res.body.token)
    // Continue the middleware chain
    next()
  })

// Maps to GET /protected
client
  .resource('protected')
  .path('/protected')

// Render the API
var api = client.render()

// Test it
api.auth
  .signup()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res) {
    console.log('Response:', res.body)
    protectedRequest()
  })

function protectedRequest () {
  api
    .protected()
    .end(function (err, res) {
      console.log('Protected response:', res.body)
    })
}
