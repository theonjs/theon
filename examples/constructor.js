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

var users = client
  .collection('users')
  .basePath('/users')

users
  .resource('get')
  .path('/:id')
  // Use a custom constructor function to process incoming arguments easily
  .useConstructor(function (id) {
    this.param('id', id)
    // return this -> You can optionally return a custom object here
  })

// Render the API
var api = client.render()

api.users
  // Pass path param directly as argument, instead of doing: .param('id', '123')
  .get('123')
  .end(function (err, res) {
    console.log('Body:', res.body)
  })
