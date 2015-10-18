var nock = require('nock')
var theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123')
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
  .path('/:id')


// Render the API client
var api = users.renderAll()

api
  .users
  .get()
  // We must call this method to define the proper param
  // otherwise, the request will be resolved with a requirement error
  .param('id', 123)
  .end(function (err, res) {
    console.log('Done!')
  })