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

var users = client
  .basePath('/api')
  .collection('users')
  .resource('get')
  .path('/:id')
  // Attach a resource level validator
  .validator(function (req, res, next) {
    if (req.params.id > 10000) {
      return next(new Error('validation error: id param must be lower than 10000'))
    }
    next() // otherwise continue
  })
  // Attach a resource level response validator
  .responseValidator(function (req, res, next) {
    if (!res.body) {
      return next(new Error('response validation error: body cannot be empty'))
    }
    next() // otherwise continue
  })

// Render the API client
var api = users.renderAll()

api
  .users
  .get()
  .param('id', 123)
  // Attach another validator at public API client level
  .validator(function (req, res, next) {
    if (typeof req.params.id !== 'number') {
      return next(new Error('validation error: id param must a number'))
    }
    next() // otherwise continue
  })
  .end(function (err, res) {
    console.log('Done!')
  })
