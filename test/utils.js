const expect = require('chai').expect
const utils = require('../lib/utils')

suite('utils', function () {
  test('extend', function () {
    var o = {x: true}
    var x = utils.extend(o, {y: true})
    expect(o).to.be.equal(x)
    expect(o.x).to.be.true
    expect(o.y).to.be.true
  })

  test('merge', function () {
    var o = {x: true}
    var x = utils.merge(o, {y: true})
    expect(o).to.not.be.equal(x)
    expect(o.x).to.be.true
    expect(o.y).to.be.undefined
    expect(x.x).to.be.true
    expect(x.y).to.be.true
  })

  test('clone', function () {
    var o = {x: true}
    var x = utils.clone(o)
    expect(o).to.not.be.equal(x)
    expect(o.x).to.be.true
  })

  test('has', function () {
    var o = {x: true}
    expect(utils.has(o, 'x')).to.be.true
    expect(utils.has(o, 'y')).to.be.false
    expect(utils.has(o, 'toString')).to.be.false
    expect(utils.has(null, 'x')).to.be.false
    expect(utils.has(0, 'x')).to.be.false
  })

  test('normalize', function () {
    var o = {'Foo': true}
    expect(utils.normalize({Foo: true})).to.be.deep.equal({foo: true})
    expect(utils.normalize({FOO: true})).to.be.deep.equal({foo: true})
    expect(utils.normalize({foo: true})).to.be.deep.equal({foo: true})
  })

  test('lower', function () {
    expect(utils.lower('FoO')).to.be.equal('foo')
    expect(utils.lower(null)).to.be.equal('')
    expect(utils.lower({})).to.be.equal('')
  })

  test('pathParams', function () {
    expect(utils.pathParams('/path/:id', {id: '123'}))
      .to.be.equal('/path/123')
    expect(utils.pathParams('/:id/:name', {id: '123', name: 'foo'}))
      .to.be.equal('/123/foo')
    expect(function () {
      utils.pathParams('/:missing', {})
    }).to.throw(Error)

  })
})
