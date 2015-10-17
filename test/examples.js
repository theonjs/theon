const path = require('path')
const fs = require('fs')
const series = require('../lib/utils').series
const expect = require('chai').expect
const spawn = require('child_process').spawn

const rootDir = path.join(__dirname, '..')
const examplesDir = path.join(rootDir, 'examples')

const ignore = [ 'README.md', 'browser.html' ]

suite('examples', function () {
  test('run examples', function (done) {
    this.timeout(10 * 1000)

    var files = fs.readdirSync(examplesDir)
    var tests = files.map(function (file) {
      return function (next) {
        testExample(file, next)
      }
    })

    series(tests, done)

    function testExample(file, next) {
      if (~ignore.indexOf(file)) return next()

      var examplePath = path.join(examplesDir, file)
      var child = spawn('node', [ examplePath ])

      child.stderr.on('data', function (chunk) {
        next(new Error(chunk.toString()))
      })

      child.on('close', function (code) {
        if (code !== null && code > 0)
          next(new Error('Process exited for file ' + file + ' with code: ' + code))
        else
          next()
      })

      setTimeout(function () {
        child.kill('SIGHUP')
      }, 200)
    }
  })
})
