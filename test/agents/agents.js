const expect = require('chai').expect
const agents = require('../../lib/agents')

suite('agents', function () {
  function agentStub() {}

  test('set', function () {
    var defaults = agents.defaults()
    agents.set(agentStub)

    expect(agents.defaults()).to.be.equal(agentStub)
    expect(agents.agents.embed).to.be.equal(agentStub)

    expect(function () {
      agents.set(null)
    }).to.throw(TypeError)

    agents.set(defaults)
  })

  test('add', function () {
    agents.add('foo', agentStub)

    expect(agents.get('foo')).to.be.equal(agentStub)
    expect(agents.agents.foo).to.be.equal(agentStub)

    expect(function () {
      agents.set(null, agentStub)
    }).to.throw(TypeError)

    expect(function () {
      agents.set('foo', null)
    }).to.throw(TypeError)
  })

  test('remove', function () {
    agents.add('foo', agentStub)

    expect(agents.get('foo')).to.be.equal(agentStub)
    expect(agents.agents.foo).to.be.equal(agentStub)

    agents.remove('foo')
    expect(agents.get('foo')).to.be.undefined
    expect(agents.agents.foo).to.be.undefined
  })
})
