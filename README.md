# theon [![Build Status](https://api.travis-ci.org/h2non/theon.svg?branch=master&style=flat)][travis] [![Code Climate](https://codeclimate.com/github/h2non/theon/badges/gpa.svg)](https://codeclimate.com/github/h2non/theon) [![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon)

A lightweight, declarative and [featured](#features) JavaScript library to create domain-specific, extensible, expressive and fluent programmatic bindings to any HTTP layer (e.g: API clients, SDKs...).

`theon` was mainly designed to provide a convenient abstraction layer between remote HTTP interfaces and programmatic layer. It assist you to simplify and minimize the boilerplate process when writting API clients, taking one core idea: just declare your API one time, run it everywhere.

To get started, you can take a look to [usage instructions](#usage), [examples](https://github.com/h2non/theon/tree/master/examples), [midleware layer](#middleware), supported [HTTP agents](#http-adapters) and [API](#api) docs.

**Still beta**.

## Contents

- [Features](#features)
- [Benefits](#benefits)
- [Motivation](#motivation)
- [Concepts](concepts)
- [Installation](#installation)
- [Environments](#environments)
- [Usage](#usage)
- [HTTP adapters](#http-adapters)
  - [Writting HTTP adapters](#writting-http-adapters)
- [Plugins](#plugins)
- [Middleware](#middleware)
  - [Writting a middleware](#writting-a-middleware)
- [Hooks](#hooks)
  - [Writting hooks](#writting-hooks)
- [Validators](#validators)
  - [Writting validators](#writting-validators)
- [API](#api)

<!-- - [Plugins](#plugins) -->

## Features

- Simple and declarative API
- Modular pluggable design
- Hierarchical middleware layer (inspired by [connect](https://github.com/senchalabs/connect))
- Nested configurations based on inheritance
- Domain-specific API generation
- Observable hooks
- Request/response interceptors (via middleware)
- Request/response validators
- Bind bodies to custom models
- Basic support for node.js streams
- Path params parsing and matching
- Generates a fluent and semantic programmatic API
- HTTP client agnostic: use `request`, `superagent`, `jQuery` or any other via adapters
- Dependency free
- Designed for testability (via interceptor middleware)
- Lightweight: 18KB (~6KB gzipped)
- Runs in browsers and node.js

## Benefits

- Write APIs in a simple but powerful way
- Easily create domain-specific fluent APIs
- Create API clients that are simple and easy to maintain
- Decouple and underline HTTP interface details from API consumers
- Use or write your own plugins to augment some specific feature
- Validate request and response before and after the request is resolved
- Minimize the boilerplate while writting API clients
- Bind bodies to models easily
- Hierarchical nested configuration with inheritance support
- HTTP agent agnostic: pick what do you need based on the environment (`request`, `superagent`, `$.ajax`, or used the embed one)
- Ubiquitous: write one API. Run it in any JavaScript environment
- Easy to test via interceptor middleware

## Motivation

I wrote this library to mitigate my frustration while writting further programmatic API clients to HTTP APIs in JavaScript environments.

After dealing with recurrent scenarios, I realized that the process is essentially boilerplate in most cases, and a specific solution can be conceived to simplify the process and provide recurrent features to satifify common needs.

In most scenarios when creating APIs you have to build an abstract programmatic layer which maps to specific HTTP resources, mostly when dealing with REST oriented HTTP services.
With `theon` you can decouple those parts and provide a convenient abstraction between the HTTP interface details and programmatic API consumers.

Additionally it provides a set of rich features to make you programmatic layer more powerful for either you as API builder and your API consumers, through a hierarchical middleware layer allowing you to plugin intermediate logic.

## Concepts

`theon` introduces the concept of entity, which is basically a built-in abstract object which maps to specific HTTP entities and stores its details, such as headers or query params.

You have to understand and use them properly while building you API.

The following graph represent the relation between theon entities and a common HTTP REST-like endpoint:

```
   /api         /users          /id      /favorites
     ↓             ↓             ↓           ↓
  [client] + [collection] + [resource] + [resource]
     ↓             ↓             ↓           ↓
  [mixin]?      [mixin]?     [mixin]?     [mixin]?
```

**Built-in entities**:

#### client

`client` represents the API client parent high-level entity.
Every `theon` instance is a client and it's restricted to only one per `theon` instance.

- Can inherit from other `entity`, usually another `client`.
- Can host `collections` and `resources`
- Can have `mixins`

#### collection

`collection` represents a set of entities. It was mainly designed to store a bunch of  other `collection` or `resources`, mostly used as sort of isolation entity to divide and compose different parts of your API.

- Can inherit from other `entity`, usually a `client`.
- Can host other `collections` or `resources`
- Can have `mixins`
- Cannot perform requests itself

#### resource

`resource` is an entity designed to be attached to a specific HTTP resource, endpoint or action. They're usually embedded as part of collections.

- Can inherit from other `entity`, usually a `collection`.
- Can host `collections`, `resource`
- Can have `mixins`
- Can perform requests

#### mixin

A `mixin` is a custom user-defined preconfigured task hosting any kind of logic.
The `mixin` entity is analog to its programmaming terminology, meaning it mostly to extend a component with some specific feature as a sort of plug in.

- Can inherit from other entities, usually a `resource`.
- Cannot host other entities
- Cannot have other `mixins`
- Can perform requests (either by native implementation or inheriting the client)

## Installation

Via npm:
```bash
npm install theon --save
```

Via bower:
```bash
bower install theon --save
```

Or loading the script:
```html
<script src="//cdn.rawgit.com/h2non/theon/0.1.0/theon.js"></script>
```

## Environments

Runs in any [ES5 compliant](http://kangax.github.io/mcompat-table/es5/) engine

![Node.js](https://cdn0.iconfinder.com/data/icons/long-shadow-web-icons/512/nodejs-48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
---  | --- | --- | --- | --- | --- |
+0.10 | +5 | +3.5 | +9 | +10 | +5 |

## Usage

Declare your API
```js
var theon = require('theon')

// First, we must build a new client
var clientBuilder = theon('http://my.api.com')
  .basePath('/api')
  .set('Version', '1.0')
  .use(function (req, res, next) {
    // Global HTTP middleware
    next()
  })

// Attach a new collection
var collection = clientBuilder
  .collection('users')
  .basePath('/users')
  .use(function (req, res, next) {
    // Collection specific HTTP middleware
    next()
  })

// Attach a new resource to that collection
collection
  .resource('get')
  .alias('find')
  .path('/:id')
  .method('GET')
  .use(function (req, res, next) {
    // Resource specific middleware
    next()
  })
```

Render it:
```js
// Rending the API will create and expose the public
// interface ready to be used by your API consumers
var apiClient = client.render()
```

Finally, use the API as a consumer:
```js
// Use the API as consumer
apiClient
  .users
  .get()
  .param('id', 123)
  .type('json')
  .use(function (req, res, next) {
    // Request phase specific middleware
    next()
  })
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
    console.log('Body:', res.body)
  })
```

## Examples

See the [`examples`](https://github.com/h2non/theon/tree/master/examples) directory for featured examples.

## HTTP adapters

One of the design goals of `theon` is making it HTTP agent agnostic, meaning it's not couple to any specific one, or in other words, given the ability to the developer to pick which one is prefered based on its specific needs and runtime scenario.

To become more concrete, `theon` is not an HTTP client perse, neither implements one, it's just an abstraction layer to build and configure HTTP domain specific stuff.

So instead of implementing an HTTP client, `theon` relies on an external adapter which should be responsible of communicate with the real HTTP client, providing a proxy layer between `theon` interface and HTTP agent specific interface.

`theon` provides by default two HTTP adapters for both node.js and browser environment, but it's up-to-you to write your own adapter to talk with another HTTP client, such as `superagent`, `got`, `$.ajax`, `angular.$http` or any other.

#### Node.js

- [request](https://github.com/request/request) `default` - Popular and featured HTTP client

#### Browsers

- [lil-http](https://github.com/lil-js/http) `default` - Lightweight XHR wrapper for browsers

### API

An HTTP agent should be a `function` expecting the following params:

- **req** - [`theon.RawContext`](#rawcontext) - Request params context storing headers
- **res** - [`theon.Response`](#responserequest) - Response object to fill
- **cb** - `Function(Error, theon.Response)` - Callback to resolve the request

And the `function` must return an object, which should implement at least the `abort()` method.

To clarify, using the TypeScript interface notation, it would be:
```ts
interface AdapterResponse {
  abort(): void;
}

function httpAdapter(
  req: theon.RawContext,
  res: theon.Response,
  cb: (Error, theon.Response) => void
) AdapterResponse
```

### Writting HTTP adapters

One of the main responsabilities of an HTTP agent adapter is acting as a interface mapper between `theon` scope and the target HTTP client, adapting both request and response interfaces.

Here you can see an example of an HTTP adapter implementation for the node's [request](https://github.com/request/request) package:

```js
var theon = require('theon')
var request = require('request')

function requestAdapter(req, res, cb) {
  var opts = {
    url: req.url,
    qs: req.query,
    body: req.body,
    headers: req.headers,
    method: req.method,
    useQuerystring: true
  }

  // Set JSON format
  opts.json = req.opts.format === 'json'

  // Set auth credentials, if required
  if (req.opts.auth) {
    opts.auth = req.opts.auth
  }

  // Extend agent-specific options
  Object.assign(opts, req.agentOpts)

  // If stream passed, pipe it!
  // Note: not all the HTTP clients has to support stream
  // in that case, you can resolve with an error or throw something
  return req.stream
    ? req.stream.pipe(request(opts, handler))
    : request(opts, handler)

  function handler(err, _res, body) {
    cb(err, adapter(res, _res, body))
  }
}

// We map fields to theon.Response interface for full compatibility
function adapter(res, _res, body) {
  if (!_res) return res

  // Expose the agent-specific response
  res.setOriginalResponse(_res)

  // Define recurrent HTTP fields
  res.setStatus(_res.statusCode)
  res.setStatusText(_res.statusText)
  res.setHeaders(_res.headers)

  // Define body, if present
  if (body) res.setBody(body)

  return res
}

// Important: tell theon to use the HTTP adapter
theon.agents.set(requestAdapter)
```

## Plugins

Due to the library is young at this time, there are not plugins available, however I would like to write a couple of them in a near future. Here's is wish list:

- **consul** - Server discovery using Consul
- **retry** - Provide retry a policy in your API clients
- **JSONSchema** - Validate incoming and outgoing bodies againts a JSON schema.

## Middleware

`theon` has been designed with strong extensibility capabilities in mind.
Extensibility in `theon` is mostly achieved via its built-in middleware layer,
which allows you to plug in and extend the client features with custom logic.

Middleware layer has a hierarchical design, meaning you can plug in middlewares in parent scopes and them will be called from child scopes. For instance, you can plug in a middleware at client global scope, and then nested one at resource level. Both middleware will be called, from top to bottom in hierarchical order, thus global will come first.

Middleware layer is behavies like a FIFO queue with control-flow capabilities, meaning you can run asynchrous tasks too.

It was strongly inspired in the well-known middleware pattern by connect/express.

### Phases

- **request** - Dispatched before send the request over the network
- **response** - Dispatched after the client receives the response

### API

#### Request#use(middleware)
Alias: `useRequest`

Attach a new middleware in the `request` phase.

#### Request#useResponse(middleware)

Attach a new middleware in the `response` phase.

#### Middleware notation

`middleware` must implement the following TypeScript notation:

```ts
function middleware(
  req: theon.RawContext,
  res: theon.Response,
  next: (Error?, theon.Response?) => void
)
```

### Writting a middleware

Writting a middleware is a simple task.
If you already know how to write a middleware for connect/express, you're mostly done.

The following example implements a `request` phase middleware
```js

```

## Hooks

`theon` provides a built-in layer to attach hooks to observe and manage in detail the different phases in the HTTP flow live cycle inside your client.

They has been specially designed to provide control capabilities across the different internal phases of any HTTP transaction handled internally in `theon` clients.
Furthermore, they are mostly useful to perform `pre` and `post` processing operations, such as defining defaults params and adapt/map things before they're processed by subsequent phases.

Hooks behavies like a traditional middleware, meaning you can alter, replace, intercept or even cancel any HTTP transaction at any stage.

Hooks also rely in control-flow capabilities, so you can run asynchronous tasks inside them.

### Phases

List of supported hook phases by execution order:

- **before**
- **before request**
- **before middleware request**
- **middleware request**
- **after middleware request**
- **before validator request**
- **validator request**
- **after validator request**
- **after request**
- **before dial**
- **dialing**
- **after dial**
- **before response**
- **before middleware response**
- **middleware response**
- **after middleware response**
- **before validator response**
- **validator response**
- **after validator response**
- **after response**
- **after**
- **error** - Only dispatched in case of error

### API

#### Request#observe(phase, hook)

Attach a new observer hook to a given phase.

#### Hook notation

`hook` must implement the following TypeScript notation:

```ts
function hook(
  req: theon.RawContext,
  res: theon.Response,
  next: (Error?, theon.Response?) => void
)
```

### Writting hooks

Observable hooks has the same interface, and thus the same implementation as standard middleware or validators.

```js
var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .resource('users')
  .path('/users')

// Attach a default observer for all the requests
users
  .observe('response', function (req, res, next) {
    console.log('Log response:', res.statusCode, res.headers)
    next()
  })

// Render the API client
var api = users.renderAll()

api
  .users()
  // Attach an observer for the current request at API client level
  .observe('response', function (req, res, next) {
    console.log('Log body:', res.body)
    next()
  })
  .end(function (err, res) {
    console.log('Done!')
  })
```

## Validators



### Phases

### API

### Writting a validator

## API

### theon([ url ]) => `Client`

Create a new API builder.

#### theon.client([ url ])
Inherits from [`Entity`](#entity)

Create a new `client` entity

#### theon.collection(name)
Inherits from [`Entity`](#entity)

Create a new `collection` entity

#### theon.resource(name)
Inherits from [`Entity`](#entity)

Create a new `resource` entity

#### theon.mixin(name, fn)
Inherits from [`Entity`](#entity)

Create a new `mixin` entity

#### theon.agents

API to manage HTTP agents adapters.

#### theon.agents.agents = { name: agentAdapterFn }

Map of agents by name and adapter function.

#### theon.agents.defaults() => `function`

Retrieve the default HTTP agent adapter bases on the runtime environment.

#### theon.agents.get(name) => `function`

Retrieve an HTTP agent adapter by name.

#### theon.agents.set(agent)

Set an HTTP agent to be used by default.
All the HTTP traffic will be handled by this agent.

#### theon.agents.add(name, adapterFn)

Register a new HTTP agent adapter by name.

### Entity
Inherits from [`Request`](#request)

#### Entity#alias(name)

Add an additional entity alias name.

#### Entity#collection(collection)

Attach a collection to the current entity.

#### Entity#action(action)
Alias: `resource`

Attach an action to the current entity.

#### Entity#mixin(mixin)
Alias: `helper`

Attach a mixin to the current entity.

#### Entity#addEntity(entity)

Attach a custom subentity.

#### Entity#render([ entity ])

Render the entity. This method is mostly used internally.

### Request([ ctx ])

#### Request#url(url)

Define the base URL of the server.

#### Request#path(path)

Define an URL final path value. `path` will be concatenated to `basePath`.

#### Request#basePath(path)

Define a URL base path value.

#### Request#method(name)

HTTP method to use. Default to `GET`.

#### Request#param(name, value)

#### Request#params(params)

#### Request#persistParam(name, value)

#### Request#persistParams(params)

#### Request#unsetParam(name)

#### Request#setParams(params)

#### Request#query(query)

#### Request#setQuery(query)

#### Request#queryParam(name, value)

#### Request#unsetQuery(name)

#### Request#persistQueryParam(name, value)

#### Request#set(name, value)
Alias: `header`

#### Request#unset(name)

#### Request#headers(headers)

#### Request#setHeaders(headers)

#### Request#persistHeader(name, value)

#### Request#persistHeaders(headers)

#### Request#type(name)

#### Request#format(type)

#### Request#send(body)
Alias: `body`

#### Request#cookie(name, value)

#### Request#unsetCookie(name)

#### Request#auth(user, password)

#### Request#use(middleware)
Alias: `useRequest`

#### Request#useResponse(middleware)

#### Request#observe(event, hook)

#### Request#validator(validator)
Alias: `requestValidator`

#### Request#responseValidator(validator)

#### Request#interceptor(interceptor)

#### Request#map(fn)
Alias: `bodyMap`

#### Request#validate(cb)

#### Request#model(model)

#### Request#agent(agent)

#### Request#agentOpts(opts)

#### Request#setAgentOpts(opts)

#### Request#persistAgentOpts(opts)

#### Request#options(opts)

#### Request#persistOptions(opts)

#### Request#useParent(parent)

#### Request#end(cb)
Alias: `done`

#### Request#pipe(stream)

#### Request#stream(stream)
Alias: `bodyStream`

#### Request#raw() => [RawContext](#RawContext)

### Response(request)

#### Response#headers = `object`

#### Response#body = `mixed`

#### Response#error = `mixed`

#### Response#statusCode = `number`

#### Response#statusText = `string`

#### Response#orig = `object`

#### Response#setOriginalResponse(orig)

#### Response#setBody(body)

#### Response#setHeaders(headers)

#### Response#setType(contentType)

#### Response#setStatus(status)

#### Response#setStatusText(text)

#### Response#toError() => `Error`

### Context([ parent ])

#### Context#store = `Store`

#### Context#method = `string`

#### Context#body = `mixed`

#### Context#stream = `ReadableStream`

#### Context#useParent(ctx)

#### Context#raw()

#### Context#clone()

#### Context#buildPath()

### RawContext

Side-effect free raw HTTP context params.
It's passed to the middleware and validator call chain.

#### RawContext#headers = `object`

#### RawContext#query = `object`

#### RawContext#params = `object`

#### RawContext#body = `mixed`

#### RawContext#method = `string`

#### RawContext#stream = `ReadableStream`

#### RawContext#opts = `object`

#### RawContext#agent = `function`

#### RawContext#agentOpts = `object`

#### RawContext#ctx = `Context`

Current original context instance.

#### RawContext#req = `Request`

Current original request instance.

### Store([ parent ])

#### Store#parent? = `Store`

#### Store#get(key)

#### Store#set(key, value)

#### Store#setParent(key, value)

#### Store#remove(key)

#### Store#has(key)

#### Store#useParent(store)

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[travis]: http://travis-ci.org/h2non/theon
