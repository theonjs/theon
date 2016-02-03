const nock = require('nock')
const theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123')
  .matchHeader('Version', '1.0')
  .reply(200, [{
    id: 123,
    username: 'foo'
  }])

const client = theon('http://my.api.com')
  .set('Version', '1.0')
  .basePath('/api')
  .format('json')

const users = client
  .collection('users')
  .basePath('/users')
  // Decorate entity contructor
  .decorate(function (delegate) {
    delegate.root.set('Content-Type', 'application/json')
    return delegate
  })

users
  .resource('get')
  .path('/:id')
  // Decorate resource constructor
  .decorate(function (delegate) {
    return function decorator (id) {
      const delegation = delegate()
      delegation.param('id', id)
      return delegation
    }
  })

// Render the API
const api = client.render()

api.users
  // Path param in now supported in the constructor via decorator
  .get('123')
  .end(function (err, res) {
    console.log('Body:', res.body)
  })
