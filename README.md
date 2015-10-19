# theon [![Build Status](https://api.travis-ci.org/h2non/theon.svg?branch=master&style=flat)][travis] [![Code Climate](https://codeclimate.com/github/h2non/theon/badges/gpa.svg)](https://codeclimate.com/github/h2non/theon) [![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon)

A lightweight, declarative and [featured](#features) JavaScript library to create API clients and SDKs for node.js and browsers to build domain-specific, extensible, expressive and fluent programmatic bindings to any HTTP layer.

`theon` provides a convenient abstraction to build rich API clients which interacts with one or multiple HTTP layers. It was designed with extensibility and versatibility in mind, providing a built-in [middleware layer](#middleware) which supports [plugins](#plugins), observer [hooks](#hooks), [validators](#validators), [interceptors](#interceptors) and [more](#valiators).

It's also HTTP agent agnostic, so you can use `superagent`, `request`, `$.ajax`, `angular.$http` or any other via adapters based on your project requirements and runtime scenario.

To get started, take a look to [base concepts](#concepts), [tutorial](#tutorial) and [examples](https://github.com/h2non/theon/tree/master/examples).

**Note**: still young, some work needs to be done, mostly in terms of documentation and testing, but API consistency is guaranteed.

## Contents

- [Features](#features)
- [Benefits](#benefits)
- [Motivation](#motivation)
- [Concepts](#concepts)
  - [Client](#client)
  - [Collection](#collection)
  - [Resource](#resource)
  - [Mixin](#mixin)
- [Installation](#installation)
- [Environments](#environments)
- [Tutorial](#tutorial)
- [Examples](#examples)
- [HTTP adapters](#http-adapters)
    - [Node.js](#nodejs)
    - [Browsers](#browsers)
  - [API](#api)
  - [Writing HTTP adapters](#writing-http-adapters)
- [Plugins](#plugins)
- [Middleware](#middleware)
  - [Phases](#phases)
  - [API](#api-1)
  - [Writing a middleware](#writing-a-middleware)
- [Hooks](#hooks)
  - [Phases](#phases-1)
  - [API](#api-2)
  - [Writing hooks](#writing-hooks)
- [Validators](#validators)
  - [Phases](#phases-2)
  - [API](#api-3)
  - [Writing a validator](#writing-a-validator)
- [Interceptors](#interceptors)
  - [Phases](#phases-3)
  - [API](#api-4)
  - [Writing an interceptor](#writing-an-interceptor)
- [Evaluators](#evaluators)
  - [Phases](#phases-4)
  - [API](#api-5)
  - [Writing an evaluator](#writing-an-evaluator)
- [API](#api-6)
- [License](#license)

## Features

- Simple, fluent and declarative API
- Modular pluggable design with poweful composition features
- Hierarchical middleware layer (inspired in [connect](https://github.com/senchalabs/connect) middleware)
- Nested configurations with powerful inheritance
- Domain specific and fluent API generation (inspired in [superagent](https://github.com/visionmedia/superagent))
- Powerful observable hooks at any phase of the HTTP flow live cycle
- Request/response interceptors
- Request/response validators
- Bind bodies to custom models
- Powerful reusability features based on prototype inheritance.
- Built-in store context to persist session related data
- Maps HTTP entities to programmatic entities with custom logic
- Supports node.js [streams](https://github.com/h2non/theon/tree/master/examples/streams.js)
- Path params parsing and matching (with express-like path notation)
- HTTP client agnostic: use `request`, `superagent`, `jQuery` or any other HTTP agent via adapters
- Dependency free
- Designed for testability
- Lightweight: 26KB (~7KB gzipped)
- Runs in browsers and node.js

## Benefits

- Write APIs in a declarative and powerful way
- Easily create domain-specific fluent APIs
- Create API clients that are simple to use and easy to maintain
- Underline HTTP interface details from API consumers
- Map HTTP interfaces and resources to programmatic entities
- And make future changes silently from consumers eyes.
- Use or write your own plugins to augment some specific feature
- Validate request and responses params and bodies easily
- Bind bodies to models
- Perform pre/post operations (e.g: logging, validation, defaults...)
- Save session data based on the client state live cycle (e.g: auth tokens, sessions...)
- Minimize the boilerplate process while writing API clients
- HTTP agent agnostic: pick what do you need based on the environment (`request`, `superagent`, `$.ajax`, `angular.$http` via agents)
- Ubiquitous: write one API. Run it in any JavaScript environment
- Easy to test via interceptor/mock middleware

## Motivation

I initially wrote this library to mitigate my frustration while writing further programmatic API clients for multiple HTTP layers across multiple JavaScript environments.

After dealing with recurrent scenarios, I realized that the process is essentially boilerplate in most cases, so an specific solution can be conceived to simplify the process and provide a more convenient layer to do it better and faster.

In most scenarios, when you are writing APIs you have to build an abstract programmatic layer which maps to specific HTTP resources, mostly when dealing with REST oriented HTTP services.
With `theon` you can decouple those parts and provide a convenient abstraction between the HTTP interface details and programmatic API consumers.

Additionally, it provides a set of rich features to make you programmatic layer more powerful for either you as API builder and your API consumers, mostly through a hierarchical middleware layer allowing you to plugin intermediate logic.

## Concepts

`theon` introduces the concept of entity, which is basically a built-in abstract object which maps to specific HTTP entities and stores its details, such as headers or query params.

You have to understand and use them properly while building your API.

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
- Supports hooks
- Extendable prototype chain with other entities

#### collection

`collection` represents a set of entities. It was mainly designed to store a bunch of  other `collection` or `resources`, mostly used as sort of isolation entity to divide and compose different parts of your API.

- Can inherit from other `entity`, usually a `client`.
- Can host other `collections` or `resources`
- Can have `mixins`
- Cannot perform requests itself
- Supports hooks
- Extendable prototype chain with other entities

#### resource

`resource` is an entity designed to be attached to a specific HTTP resource, endpoint or action. They're usually embedded as part of collections.

- Can inherit from other `entity`, usually a `collection`.
- Can host `collections`, `resource`
- Can have `mixins`
- Can perform requests
- Supports hooks
- Extendable prototype chain with other entities

#### mixin

A `mixin` is a custom user-defined preconfigured task hosting any kind of logic.
The `mixin` entity is analog to its programmaming terminology, meaning it mostly to extend a component with some specific feature as a sort of plug in.

- Can inherit from other entities, usually a `resource`.
- Cannot host other entities
- Cannot have other `mixins`
- Can perform requests (either by native implementation or inheriting the client)
- Do not support entity-level hooks
- Prototype chain cannot be extended

## Extensibility and composition

`to do`

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
<script src="//cdn.rawgit.com/h2non/theon/0.1.1/theon.js"></script>
```

## Environments

Runs in any [ES5 compliant](http://kangax.github.io/mcompat-table/es5/) engine

![Node.js](https://cdn0.iconfinder.com/data/icons/long-shadow-web-icons/512/nodejs-48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
---  | --- | --- | --- | --- | --- |
+0.10 | +5 | +3.5 | +9 | +12 | +5 |

## Tutorial

Let's imagine we want to create a programmatic API client to interact with a remote HTTP service easily.

We have the following requirements:

- The HTTP API only uses JSON as interchange format.
- We have to pass a header to define the API version
- Resource resources are protected and requests must be autenticated

And we have the following HTTP interface:

- POST /api/auth/login
- POST /api/auth/signup
- GET /api/users - `auth required`
- GET /api/users/:id - `auth required`
- POST /api/users/:id - `auth required`
- DELETE /api/users/:id - `auth required`

Firstly, as API developers, we're going to create and configure our client through `theon`:

```js
var theon = require('theon')

var client = theon('http://my.api.com')
  .set('Version', '1.0') // Define the API version header at global level
  .basePath('/api') // We define the base path for all the requests
  .type('json') // Our payloads and responses will be always JSON
```

Then, we can start declaring the entities based on the HTTP API paths.

Lets start building the `auth` entity.
```js
var auth = client
  .collection('auth')
  .basePath('/auth')
  .method('POST') // use this method for all the requests

// Maps to POST /api/auth/login
auth
  .action('login')
  .path('/login')

// Maps to POST /api/auth/signup
auth
  .action('signup')
  .path('/signup')
  // Every time a new user is created successfully
  // we store the session and set the auth header for future requests
  .useResponse(function (req, res, next) {
    // Store the response for future use
    req.root.store.set('session', res.body)
    // Set token for autentication to all the outgoing requests
    req.root.persistHeader('Authorization', res.body.token)
    // Continue the middleware chain
    next()
  })
````

Now we have our `auth` entity declared.
Lets continue declaring the `users` entity in a different collection:

```js
var users = client
  .collection('users')
  .basePath('/users')

// Maps to GET /api/users
users
  .action('find')
  .alias('search')

// Maps to GET /api/users/:id
users
  .action('get')
  .path('/:id')

// Maps to POST /api/users/:id
users
  .action('update')
  .path('/:id')
  .method('POST')

// Maps to DELETE /api/users/:id
users
  .action('delete')
  .path('/:id')
  .method('DELETE')
  // Attach a response middleware to perform post request operations
  .useResponse(function (req, res, next) {
    // Every time the user is deleted, we clean its session
    req.root.store.remove('session')
    req.root.unset('Authorization')
    // Continue the middleware chain
    next()
  })
```

Now we have all our API defined, but it's not ready yet for API end consumers.
We have to render it to provide the public API ready to be used by API consumers.

Let's render it:
```js
var api = client.render()
```

Now the public API is available via `api`.
Lets see how it was rendered and play a bit with it as end API consumers.

In the following example we're going to register a new user:
```js
api.auth
  .signup()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res, client) {
    console.log('Response:', res.statusCode, res.body)
  })
```

Now our client is authenticated, so we can try to fetching the user:
```js
api.users
  .get()
   // important: we have to pass the path param
  .param('id', 1)
  // Note the don't have to explicitely pass any authentication credentials
  .end(function (err, res) {
    console.log('User:', res.body)
  })
```

Also, we can perform a users search:
```js
api.users
  .find()
  .query({ username: 'foo' })
  .end(function (err, res) {
    console.log('Search:', res.body)
  })
```

Finally, we want to delete the user:
```js
api.users
  .delete()
  .param('id', 123)
  .end(function (err, res) {
    console.log('Search:', res.body)
  })
```

Finally, to summarize, as you have seen, now our new API client provides a programmatic binding layer to HTTP API resources, so we can draw the following relation map:

- POST /api/auth/login => `api.auth.login()`
- POST /api/auth/signup => `api.auth.login()`
- GET /api/users => `api.users.find()`
- GET /api/users/:id => `api.users.get()`
- POST /api/users/:id => `api.users.create()`
- DELETE /api/users/:id => `api.users.delete()`

You can see (and run) the tutorial script [here](https://github.com/h2non/theon/tree/master/examples/tutorial.js).

## Examples

Take a look to the [`examples`](https://github.com/h2non/theon/tree/master/examples) directory for featured use case examples.

## HTTP adapters

One of the design goals of `theon` is making it HTTP agent agnostic, meaning it's not coupled to any specific HTTP client and runtime environment boundaries.

In other words, `theon` gives the ability to the developer to pick the prefered one based on its particular needs and runtime scenario, so if you're creating an API client for browsers and particular framework, let's say AngularJS, you don't have any constraint impossed by `theon` to use it.

To clarify this, it worths to say that `theon` is not an HTTP client perse, neither implements stuff related to the HTTP network domain, it's just an abstraction layer providing a DSL to build and configure high-level HTTP protocol specific stuff.

So instead of implementing an HTTP client, `theon` relies on an external adapter which should be responsible of communicating with the real HTTP client, accesible by the proxy layer between `theon` interface and the target HTTP agent, so all the HTTP network level stuff is completely delegated in the agent adapter.

In other to be more pragmatic, `theon` provides by default two HTTP adapters for both node.js and browser environments, but it's up to you to write your own adapter to talk with another HTTP client, such as `superagent`, `got`, `$.ajax`, `angular.$http` or any other.

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

### Writing HTTP adapters

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
- **APIDocs** - Generate Swagger/Apiary docs reading the resource metadata annotations

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

### Writing a middleware

Writing a middleware is simple.
If you already know how to write a middleware for connect/express, you're mostly done.

```js
var client = theon('http://my.api.com')
  .set('Version', '1.0')
  .basePath('/api')
  .use(function (req, res, next) {
    // Global HTTP middleware
    console.log('Running global middleware...')
    next()
  })

client
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  .use(function (req, res, next) {
    console.log('Resource request middleware...')
    next()
  })
  .useResponse(function (req, res, next) {
    console.log('Resource response middleware...')
    next()
  })

// Render the cient
var api = client.render()

api.users.get()
  .param('id', '123')
  .end(function (err, res) {
    console.log('Response:', res.status)
    console.log('Body:', res.body)
  })
```

See [examples/middleware.js](https://github.com/h2non/theon/tree/master/examples/middleware.js) for a working example.

## Hooks

`theon` provides a built-in layer to attach hooks to observe and manage in detail the different phases in the HTTP flow live cycle inside your client.

They has been specially designed to provide control capabilities across the different internal phases of any HTTP transaction handled internally in `theon` clients.
Furthermore, they are mostly useful to perform `pre` and `post` processing operations, such as defining defaults params and adapt/map things before they're processed by subsequent phases.

Hooks behavies like a traditional middleware, meaning you can alter, replace, intercept or even cancel any HTTP transaction at any stage.

Hooks can be attached to any entity, from client globa scope to resource level.

Hooks also rely in control-flow capabilities, so you can run asynchronous tasks inside them.

### Phases

Supported hook phases available for subscription, listed by execution order:

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

### Writing hooks

Observable hooks has the same interface, and thus the same implementation as standard middleware or validators.

```js
var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .set('Version', '1.0')
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')

// Attach a default observer for all the requests
users
  .observe('after response', function (req, res, next) {
    console.log('Log response:', res.statusCode, res.headers)
    next()
  })

// Render the API client
var api = users.renderAll()

api
  .users
  .get()
  .param('id', 123)
  // Attach an observer for the current request at API client level
  .observe('after response', function (req, res, next) {
    console.log('Log body:', res.body)
    next()
  })
  .end(function (err, res) {
    console.log('Done!')
  })
```

See [examples/hooks.js](https://github.com/h2non/theon/tree/master/examples/hooks.js) for a working example.

## Validators

A validator is technically a middleware that is executed before the standard middleware call chain and it's responsible of validating the request/response objects, for instance validating payloads againts a JSON schema or HAR object.

Validators can be attached to any `theon` entity and in both request/response phases.

You can use a validator to perform a validation of the request object before it's sent over the network in order to verify it has all the required params expected by the server.
In the other hand, you can validate also the response in order to determine if it's satisfy the expectations in the client side (e.g: validate teh response body, error messages...).

### Phases

- **request** - Validate the request object before it's send over the network
- **response** - Validate the response object once it has been received in the client

### API

#### Request#validator(validator)

Attach a new request validator.

#### Request#responseValidator(validator)

Attach a new response validator.

#### Validator notation

Validators has the same interface as middleware or hooks.

A `validator` function must implement the following TypeScript notation:

```ts
function validator(
  req: theon.RawContext,
  res: theon.Response,
  next: (Error?, theon.Response?) => void
)
```

### Writing a validator

```js
var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .collection('users')
  .resource('get')
  .path('/:id')
  // Attach a resource level validator
  .validator(function (req, res, next) {
    if (req.params.id > 10000) {
      return next(new Error('validation error: id param must be lower than 10000'))
    }
    next() // otherwise continue
  })
  // Attach a resource level response validator
  .responseValidator(function (req, res, next) {
    if (!res.body) {
      return next(new Error('response validation error: body cannot be empty'))
    }
    next() // otherwise continue
  })

// Render the API client
var api = users.renderAll()

api
  .users
  .get()
  .param('id', 123)
  // Attach another validator at public API client level
  .validator(function (req, res, next) {
    if (typeof req.params.id !== 'number') {
      return next(new Error('validation error: id param must a number'))
    }
    next() // otherwise continue
  })
  .end(function (err, res) {
    console.log('Done!')
  })
```

See [examples/validator.js](https://github.com/h2non/theon/tree/master/examples/validator.js) for a working example.

## Interceptors

Interceptors are a very useful feature in `theon` in other to intercept the HTTP traffic flow.

It becomes particularly useful for testing in other to mock requests for testing or provide default responses given a certain conditions.

Technically speaking it's equivalent to a middleware, so you can rely in control flow capatibilities and inspect both request/response objects.

### Phases

- **before dial** - Executed before proceed with the network dialing phase.

### API

#### Request#interceptor(interceptor)

Attach a new interceptor.

#### Interceptor notation

Validators has the same interface as middleware or hooks.

An `interceptor` function must implement the following TypeScript notation:

```ts
function interceptor(
  req: theon.RawContext,
  res: theon.Response,
  next: (Error?, theon.Response?) => void
)
```

### Writing an interceptor

```js
var client = theon('http://my.api.com')

var users = client
  .basePath('/api')
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  // Attach a resource level interceptor
  .interceptor(function (req, res, next) {
    // Determine if we should interceptor the request
    if (req.params.id > 100) {
      res.setStatus(400)
      res.setStatusText('Bad Request')
      res.setBody({ error: 'Invalid user ID' })
      // We must pass an custom string to notify we intercepted the request
      return next('intercept')
    }

    next() // otherwise continue
  })

// Render the API
var api = users.renderAll()

// Intercepted request
api.users
  .get()
  .param('id', 101)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })

// Non-intercepted
api.users
  .get()
  .param('id', 99)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })
```

See [examples/interceptor.js](https://github.com/h2non/theon/tree/master/examples/interceptor.js) for a working example.

## Evaluators

Evaluators are designed to inspect the response object and determine, given a certain user-defined rules, if the request was failed or not, and handle it accordinly.

By default `theon` doesn't handle error status such as `400` as failed request, but you can use a validator to do it and behave accordingly to your needs.

### Phases

- **response** - Executed once the client received the response from the server

### API

#### Request#evaluator(evaluator)

Attach a new evaluator function.

#### Evaluator notation

Evaluators has the same interface as middleware or hooks.

An `evaluator` function must implement the following TypeScript notation:

```ts
function evaluator(
  req: theon.RawContext,
  res: theon.Response,
  next: (Error?, theon.Response?) => void
)
```

### Writing an evaluator

```js
var users = client
  .basePath('/api')
  .collection('users')
  .basePath('/users')
  .resource('get')
  .path('/:id')
  // Attach a resource level evaluator
  .evaluator(function (req, res, next) {
    if (res.status >= 400) {
      return next(new Error('Invalid status code: ' + res.status))
    }
    next() // otherwise continue
  })

// Render the API
var api = users.renderAll()

// Invalid request
api.users
  .get()
  .param('id', 1)
  .end(function (err, res) {
    console.log('Error:', err)
  })

// Non-intercepted
api.users
  .get()
  .param('id', 2)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
  })
```

See [examples/evaluator.js](https://github.com/h2non/theon/tree/master/examples/evaluator.js) for a working example.

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

#### Entity#extend(name, value)

Extend the entity with a custom property and value.
Similar to mixins, but simpler.

#### Entity#meta(metadata)

Attach metadata to the current entity.
Mostly useful for annotations, flagging and documentation purposes.

#### Entity#render([ entity ])

Render the current entity. This method is mostly used internally.

#### Entity#renderAll([ entity ])

Render all the entities, from current to root parent.
This method is mostly used internally.

### Request([ ctx ])

#### Request#parent = `Request`

Reference to the parent `Request`, in case that it has a parent node.

#### Request#root = `Request`

Reference to the parent root node, in case that it has a parent node.

Internally, it walks across all the parent nodes recursively until find the latest.

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

#### Request#evaluator(fn)

Attach a `before response` hook to evaluate the response and determine if it's valid or not.
Useful to evaludate response status and force an error. E.g: `status` >= 400

#### Request#map(fn)
Alias: `bodyMap`

Attach a body mapper to transform, normalize, filter... the response body.
Similar to `model` feature but operating overwriting the original `body`.

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

#### Response#statusType = `number`

#### Response#statusCode = `number`

#### Response#statusText = `string`

#### Response#orig = `object`

#### Response#serverError = `boolean`

#### Response#clientError = `boolean`

#### Response#setOriginalResponse(orig)

#### Response#setBody(body)

#### Response#setHeaders(headers)

#### Response#setType(contentType)

#### Response#setStatus(status)

#### Response#setStatusText(text)

#### Response#toError() => `Error`

#### Response#ok = `boolean`

#### Response#info = `boolean`

#### Response#accepted = `boolean`

#### Response#noContent = `boolean`

#### Response#badRequest = `boolean`

#### Response#unauthorized = `boolean`

#### Response#notAcceptable = `boolean`

#### Response#notFound = `boolean`

#### Response#forbidden = `boolean`

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

#### RawContext#root = `Request`

Reference to the parent root `Request` instance.

#### RawContext#client = `Request`

Reference to the current `Request` instance.

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
