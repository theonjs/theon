const nock = require('nock')
const theon = require('..')

nock('http://localhost')
  .get('/foo')
  .reply(200, {hello: 'world'})

const client = theon('http://localhost')
  .resource('foo')
  .path('/foo')
  .render()

client.foo()
  .then(function (res) {
    console.log('Response:', res.status)
  })
  .catch(function (err) {
    console.error('Error:', err)
  })
