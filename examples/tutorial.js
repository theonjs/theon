const nock = require('nock')
const theon = require('..')

// Configure mocks
nock('http://my.api.com')
  .get('/api/users')
  .matchHeader('Authorization', '123456789')
  .reply(200, [{ useranme: 'foo', id: 1 }])

nock('http://my.api.com')
  .get('/api/users/1')
  .matchHeader('Authorization', '123456789')
  .reply(200, {username: 'foo', id: 1})

nock('http://my.api.com')
  .delete('/api/users/1')
  .matchHeader('Authorization', '123456789')
  .reply(204)

nock('http://my.api.com')
  .post('/api/auth/signup', { username: 'foo', password: 'b@r' })
  .reply(200, {token: '123456789', id: 1})

/**
 * This is an API client implementation for the following HTTP interface:
 * - POST /api/auth/login
 * - POST /api/auth/signup
 * - GET /api/users
 * - GET /api/users/:id
 * - POST /api/users/:id
 * - DELETE /api/users/:id
 */

const client = theon('http://my.api.com')
  .basePath('/api') // We define the base path for all the requests
  .type('json') // Our payloads and responses will be always JSON

const auth = client
  .collection('auth')
  .basePath('/auth')
  .method('POST') // use this method for all the requests

// Maps to POST /api/auth/login
auth
  .action('login')
  .path('/login')

// Maps to POST /api/auth/signup
auth
  .action('signup')
  .path('/signup')
  // Every time a new user is create successfully
  // we store its session and set the auth header
  .useResponse(function (req, res, next) {
    // Store the response for future use
    req.root.store.set('session', res.body)
    // Set token for autentication to all the outgoing requests
    req.root.persistHeader('Authorization', res.body.token)
    // Continue the middleware chain
    next()
  })

const users = client
  .collection('users')
  .basePath('/users')

// Maps to GET /api/users
users
  .action('find')
  .alias('search')

// Maps to GET /api/users/:id
users
  .action('get')
  .path('/:id')

// Maps to POST /api/users/:id
users
  .action('update')
  .path('/:id')
  .method('POST')

// Maps to DELETE /api/users/:id
users
  .action('delete')
  .path('/:id')
  .method('DELETE')
  // Attach a response middleware to perform post request operations
  .useResponse(function (req, res, next) {
    // Every time the user is deleted, we clean its session
    req.root.store.remove('session')
    req.root.unset('Authorization')
    // Continue the middleware chain
    next()
  })

const api = client.render()

api.auth
  .signup()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res) {
    console.log('Response:', res.statusCode, res.body)
    searchUsers()
  })

function searchUsers () {
  api.users
    .find()
    .end(function (err, res) {
      console.log('Search:', res.body)
      retrieveUser()
    })
}

function retrieveUser () {
  api.users
    .get()
    // important: we have to pass the path param
    .param('id', 1)
    // Note the don't have to explicitely pass any authentication credentials
    .end(function (err, res) {
      console.log('User:', res.body)
      deleteUser()
    })
}

function deleteUser () {
  api.users
    .delete()
    .param('id', 1)
    .end(function (err, res) {
      console.log('Delete user:', res.statusCode)
    })
}
