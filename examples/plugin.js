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

// Sample plugin implementation
function plugin (opts) {
  var enabled = opts.enable

  return function (client) {
    console.log('Registering plugin...')

    // Plugin logic goes here...
    client.use(function (req, res, next) {
      if (!enabled) return next()
      console.log('Outgoing request to:', req.opts.rootUrl)
      next()
    })

    client.observe('dialing', function (req, res, next) {
      if (!enabled) return next()
      console.log('Dialing to:', req.opts.rootUrl)
      next()
    })

    // Optionally you can expose an interface to handle the plugin state externally
    return {
      name: 'samplePlugin',
      disable: function () {
        enabled = false
      },
      enable: function () {
        enabled = true
      }
    }
  }
}

var client = theon('http://my.api.com')
  .set('Version', '1.0')
  .basePath('/api')

// Attach plugin at root level
client
  .plugin(plugin({ enable: true }))

client
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

api.users.get()
  .param('id', '123')
  .end(function (err, res) {
    console.log('Response:', res.status)
    console.log('Body:', res.body)
  })
