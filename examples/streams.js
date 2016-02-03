const stream = require('stream')
const nock = require('nock')
const theon = require('..')

nock('http://localhost')
  .get('/foo')
  .reply(200, {hello: 'world'})

nock('http://localhost')
  .post('/foo', { hello: 'world' })
  .reply(200, { hello: 'world' })

// Pipe response into a writable stream
const writable = new stream.Writable
writable._write = function (chunk, encoding, next) {
  console.log('Response:', JSON.parse(chunk.toString()))
  next()
}

const client = theon('http://localhost')
  .resource('foo')
  .path('/foo')
  .render()

client.foo()
  .pipe(writable)

// Pipe response into a writable stream
const readable = new stream.Readable
readable._read = function (chunk, encoding, next) {
  readable.push('{"hello":"world"}')
  readable.push(null)
}

const client2 = theon('http://localhost')
  .type('json')
  .method('POST')
  .resource('foo')
  .path('/foo')
  .render()

client2.foo()
  .stream(readable)
  .end(function (err, res) {
    console.log('Body', res.body)
  })
