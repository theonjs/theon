(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.theon = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var mw = require('midware')
var utils = require('./utils')
var Builder = require('./builder')

module.exports = Base

function Base(ctx) {
  this.ctx = ctx
  this.httpAgent = null
  this.httpAgentOpts = null

  this.name = null
  this.methods = []
  this.resources = []
  this.collections = []

  this.opts = {}
  this.params = {}
  this.query = {}
  this.headers = {}
  this.cookies = {}

  this.httpVerb = 'GET'
  this.aliases = []

  this.validators = {
    request: mw(this),
    response: mw(this)
  }

  this.mw = {
    request: mw(this),
    response: mw(this)
  }
}

Base.prototype.alias = function (name) {
  this.aliases.push(name)
  return this
}

Base.prototype.basePath = function (path) {
  this.opts.basePath = path
  return this
}

Base.prototype.path = function (path) {
  this.opts.path = path
  return this
}

Base.prototype.options = function (opts) {
  utils.merge(this.opts, opts)
  return this
}

Base.prototype.param = function (name, value) {
  this.params[name] = value
  return this
}

Base.prototype.queryParam = function (name, value) {
  this.query[name] = value
  return this
}

Base.prototype.type = function (name) {
  this.headers['content-type'] = name
  return this
}

Base.prototype.header = function (name, value) {
  this.headers[name] = value
  return this
}

Base.prototype.setHeaders = function (headers) {
  this.headers = headers
  return this
}

Base.prototype.removeHeader = function (name) {
  delete this.headers[name]
  return this
}

/**
 * Attach entities
 */

Base.prototype.collection = function (collection) {
  if (!(collection instanceof Base.Collection)) {
    collection = new Base.Collection(collection)
  }

  collection.ctx = this
  this.collections.push(collection)
  return collection
}

Base.prototype.resource = function (resource) {
  if (!(resource instanceof Base.Resource)) {
    resource = new Base.Resource(resource)
  }

  this.resources.push(resource)
  return resource
}

Base.prototype.method = function (name, path) {
  if (typeof name !== 'string')
    throw new TypeError('method argument must be a string')

  var method = new Base.Method(name, path)
  this.methods.push(method)

  return method
}

/**
 * Attach a new middleware in the incoming phase
 * @param {Function} middleware
 * @return {this}
 */

Base.prototype.use =
Base.prototype.useRequest = function (middleware) {
  this.mw.request.push(middleware)
}

Base.prototype.useResponse = function (middleware) {
  this.mw.response.push(middleware)
}

Base.prototype.validator =
Base.prototype.requestValidator = function (validator) {
  this.validators.request.push(validator)
  return this
}

Base.prototype.responseValidator = function (validator) {
  this.validators.response.push(validator)
  return this
}

Base.prototype.render = function () {
  return new Builder(this).render()
}

Base.prototype.agent = function (agent, opts) {
  if (typeof agent !== 'function')
    throw new TypeError('agent argument must be a function')

  this.httpAgent = agent
  if (opts) this.httpAgentOpts = opts
  return this
}

Base.prototype.agentOpts = function (opts) {
  this.httpAgentOpts = opts
  return this
}

},{"./builder":2,"./utils":7,"midware":8}],2:[function(require,module,exports){
module.exports = Builder

function Builder(ctx) {
  this.ctx = ctx
  this.client = null
}

Builder.prototype.render = function () {
  var ctx = this.ctx

  function BaseClient(ctx) {
    this.ctx = ctx
  }

  var proto = BaseClient.prototype

  proto.doRequest = function (method, cb) {
    var req = {
      method: method,
      headers: this.ctx.headers,
      cookies: this.ctx.cookies,
      query: this.ctx.query,
      params: thix.ctx.params,
      body: this.ctx.body
    }

    var ctx = this.ctx

    ctx.validators.request.run(req, this.ctx, function (err) {
      if (err) return cb(err)
      runMiddleware(req, ctx)
    })

    function runMiddleware(ctx, req) {
      ctx.mw.request
    }
  }

  ;['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(function (method) {
    proto[method] = function () {
      return this.doRequest(method)
    }
  })

  ctx.collections.forEach(renderMembers)
  ctx.resources.forEach(renderMembers)
  ctx.methods.forEach(renderMembers)

  function renderMembers(node) {
    var name = node.name

    if (!name)
      throw new TypeError('Cannot render, missing name')
    if (proto[name])
      throw new Error('Name conflict: "' + name + '" is already in use')

    Object.defineProperty(proto, name, {
      get: function () {
        return node.render()
      },
      enumerable: true,
      configurable: true
    })
  }

  return new BaseClient(ctx)
}

},{}],3:[function(require,module,exports){
var mw = require('midware')
var Base = require('./base')
var Collection = require('./collection')

module.exports = Client

function Client(opts) {
  Base.call(this, opts)
}

Client.prototype = Object.create(Base.prototype)

},{"./base":1,"./collection":4,"midware":8}],4:[function(require,module,exports){
var Base = require('./base')

module.exports = Base.Collection = Collection

function Collection(name) {
  if (typeof name !== 'string')
    throw new TypeError('collection name must be a string')

  Base.call(this)
  this.name = name
}

Collection.prototype = Object.create(Base.prototype)

},{"./base":1}],5:[function(require,module,exports){
var Base = require('./base')

module.exports = Base.Resource = Resource

function Resource(name) {
  if (typeof name !== 'string')
    throw new TypeError('resource name must be a string')

  Base.call(this)
  this.ctx = null
  this.name = name
  this.httpVerb = 'GET'
}

Resource.prototype = Object.create(Base.prototype)

Resource.prototype.verb = function (name) {
  this.httpVerb = name
  return this
}

},{"./base":1}],6:[function(require,module,exports){
var Client = require('./client')

module.exports = theon

/**
 * API factory
 */

function theon(opts) {
  return new Client(opts)
}

/**
 * Export modules
 */

theon.Base     = require('./base')
theon.Client   = require('./client')
theon.Client   = require('./client')
theon.Resource = require('./resource')

/**
 * Current version
 */

theon.VERSION = '0.1.0'

},{"./base":1,"./client":3,"./resource":5}],7:[function(require,module,exports){
exports.merge = function (x, y) {
  for (var k in y) {
    x[k] = y[k]
  }
  return x
}

exports.eachSeries = function (arr, iterator, cb) {
  var stack = arr.slice()
  var length = iterator.length
  cb = cb || function () {}

  function next(err) {
    if (err) return cb(err)

    var job = stack.shift()
    if (!job) return cb()

    if (length > 1) iterator(job, next)
    else next(iterator(job))
  }

  next()
}

},{}],8:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
    if (typeof module === 'object' && module !== null) {
      module.exports = exports = exports.midware
    }
  } else {
    factory(root)
  }
}(this, function (exports) {
  'use strict'

  var slice = Array.prototype.slice
  midware.VERSION = '0.1.6'

  function midware(ctx) {
    var calls = use.stack = []
    ctx = ctx || null
       
    function use() {
      var args = toArray(arguments)

      args.forEach(function (fn) {
        if (typeof fn === 'function') {
          calls.push(fn)
        }
      })

      return ctx
    }

    use.run = function run() {
      var done, args = toArray(arguments)
      
      if (typeof args[args.length - 1] === 'function') {
        done = args.pop()
      }
      
      if (!calls.length) {
        if (done) done.call(ctx)
        return
      }
      
      var stack = calls.slice()
      args.push(next)
      
      function exec() {
        var fn = stack.shift()
        try {
          fn.apply(ctx, args)
        } catch (e) {
          next(e)
        }
      }

      function next(err, end) {
        if (err || end || !stack.length) {
          stack = null
          if (done) { done.call(ctx, err, end) }
          return
        }
        exec()
      }

      exec()
    }

    use.remove = function (name) {
      for (var i = 0, l = calls.length; i < l; i += 1) {
        var fn = calls[i]
        if (fn === name || fn.name === name) {
          calls.splice(i, 1)
          break
        }
      }
    }

        
    use.flush = function () {
      calls.splice(0)
    }

    return use
  }

  function toArray(nargs) {
    var args = new Array(nargs.length)
    for (var i = 0, l = args.length; i < l; i += 1) {
      args[i] = nargs[i]
    }
    return args
  }

  exports.midware = midware
}))

},{}]},{},[6])(6)
});