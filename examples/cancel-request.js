var nock = require('nock')
var theon = require('..')

nock('http://my.api.com')
  .get('/boo')
  .delayConnection(1000)
  .reply(200, { hello: 'world' })

var client = theon('http://my.api.com')
  .resource('boo')
  .path('/boo')
  .renderAll()

client
  .boo()
  .observe('dialing', function (req, res, next) {
    next('stop')
  })
  .end(function (err, res) {
    console.log(err.message)
  })
