var nock = require('nock')
var theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123/246')
  .matchHeader('Version', '1.0')
  .reply(200, [{
    id: '123',
    username: 'foo'
  }])

var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .set('Version', '1.0')
  .collection('users')
  .basePath('/users')
  .resource('get')
  // Define the "id" path param
  .path('/:id/:action')

// Render the API client
var api = users.render()

api
  .users
  .get()
  // We must call this method to define the proper param
  // otherwise, the request will be resolved with a requirement error
  .param('id', 123)
  // You can also define param passing a function
  .param('action', function (ctx, req) {
    return req.params.id + req.params.id
  })
  .end(function (err, res) {
    console.log('Response:', res.status, res.body)
  })
