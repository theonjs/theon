var nock = require('nock')
var theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123')
  .matchHeader('Version', '1.0')
  .reply(200, [{
    id: 123,
    username: 'foo'
  }])

var client = theon('http://my.api.com')
  .set('Version', '1.0')
  .basePath('/api')
  .format('json')
  .map(function (body, next) {
    var newBody = body.map(function (user) {
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
var api = client.renderAll()

api.users.get()
  .param('id', '123')
  .end(function (err, res) {
    console.log('Body:', res.body)
  })
