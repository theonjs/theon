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
  .map(function (body, next) {
    const newBody = body.map(function (user) {
      user.id += user.id
      user.username += user.username
      return user
    })
    next(null, newBody)
  })
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')

// Render the API
const api = client.render()

api.users.get()
  .param('id', '123')
  .end(function (err, res) {
    console.log('Body:', res.body)
  })
