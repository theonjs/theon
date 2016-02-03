const nock = require('nock')
const theon = require('..')

nock('http://my.api.com')
  .get('/boo')
  .delayConnection(1000)
  .reply(200, { hello: 'world' })

const client = theon('http://my.api.com')
  .resource('boo')
  .path('/boo')
  .render()

client
  .boo()
  .observe('dialing', function (req, res, next) {
    next('stop')
  })
  .end(function (err, res) {
    console.log(err.message)
  })
