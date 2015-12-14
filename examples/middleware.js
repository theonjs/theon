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
  .set('Version', '1.0')
  .basePath('/api')
  .use(function (req, res, next) {
    // Global HTTP middleware
    console.log('Running global middleware...')
    next()
  })

client
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  .use(function (req, res, next) {
    console.log('Resource request middleware...')
    next()
  })
  .useResponse(function (req, res, next) {
    console.log('Resource response middleware...')
    next()
  })

// Render the cient
var api = client.render()

// You can access to the entity objects
// console.log('Root entity:', api.root)
// console.log('Store entity:', api.store)

// You can also use the public API middleware
api.use(function (req, res, next) {
  console.log('Public middleware...')
  next()
})

api.useResponse(function (req, res, next) {
  console.log('Response public middleware...')
  next()
})

api.observe('dialing', function (req, res, next) {
  console.log('Dialing public middleware...')
  next()
})

// Test request
api.users
  .get()
  .param('id', '123')
  .end(function (err, res) {
    if (err) throw err
    console.log('Response:', res.status)
    console.log('Body:', res.body)
  })
