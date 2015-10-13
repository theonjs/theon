var nock = require('nock')
var theon = require('..')

// Set up mock
nock('http://my.api.com')
  .get('/api/users/123')
  .matchHeader('version', '1.0')
  .reply(200, [{
    id: '123',
    username: 'foo'
  }])

var client = theon('http://my.api.com')
  .set('version', '1.0')
  .basePath('/api')

client.collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  .validator(function (req, res, next) {
    if (!req.headers.version) {
      return next(new Error('Missing required header: version'))
    }
    return next()
  })
  .responseValidator(function (req, res, next) {
    if (!res.headers.version) {
      return next(new Error('Invalid response: missing version header'))
    }
    return next()
  })

// Render the API
var api = client.render()

// Invalid request
api.users.get()
  .param('id', '123')
  .end(function (err, res) {
    console.log('Error:', err)
  })

// Invalid response
api.users.get()
  .param('id', '123')
  .set('version', '1.0')
  .end(function (err, res) {
    console.log('Error:', err)
  })
