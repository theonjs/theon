var stream = require('stream')
var nock = require('nock')
var theon = require('..')

var writable = new stream.Writable()
writable._write = function (chunk, encoding, next) {
  spy(JSON.parse(chunk.toString()))
  next()
}

writable.on('finish', function () {
  expect(spy.args[0][0]).to.be.deep.equal({ hello: 'world' })
  done()
})

nock('http://localhost')
  .get('/foo')
  .reply(200, {hello: 'world'})

var client = theon('http://localhost')
  .resource('foo')
  .path('/foo')
  .renderAll()

client.foo()
  .pipe(writable)
