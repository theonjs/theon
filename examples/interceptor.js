var theon = require('..')

var client = theon('http://httpbin.org')

client.collection('interceptor')
  .action('test')
  .path('/headers')
  .useResponse(function (req, res, next) {
    res.setStatus(200)
    res.setBody('Request intercepted')
    next('intercept')
  })

// Render the API
var api = client.render()

api.interceptor.test()
  .end(function (err, res) {
    console.log('Response:', res.status)
    console.log('Body:', res.body)
  })
