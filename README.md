# theon [![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![jsdoc-reference](https://img.shields.io/badge/jsdoc-reference-blue.svg)](http://jsdocs.herokuapp.com/github.com/h2non/theon)

> Because creating API clients should be pleasant and fun. Because using API clients should be simple and fun. Yep, fun is better!

theon is a dependency-free, [featured](#features), [pluggable](#middleware) and [declarative](#tutorial) JavaScript library to design and create domain-specific and fluent programmatic API clients and SDKs in node.js and browsers that interacts with one or multiple HTTP layers.

It was designed to be extremely extensible via its built-in hierarchical [middleware layer](#middleware), which supports high-level [plugins](#plugins), observer [hooks](#hooks), [validators](#validators) and traffic [interceptors](#interceptors).

It's also HTTP agent agnostic, so you can use `theon` with [superagent](https://github.com/visionmedia/superagent), [request](https://github.com/request/request), [fetch](https://fetch.spec.whatwg.org), [$.ajax](http://api.jquery.com/jquery.ajax/), [angular.$http](https://docs.angularjs.org/api/ng/service/$http) or any other agent via [adapters](#http-adapters).

To get started, take a look at [core concepts](#entities), [tutorial](#tutorial) and [examples](https://github.com/h2non/theon/tree/master/examples).

theon is currently used in production applications in both node.js and browser environments.

## Contents

- [Features](#features)
- [Benefits](#benefits)
- [Installation](#installation)
- [Environments](#environments)
- [Motivation](#motivation)
- [Entities](#entities)
  - [Client](#client)
  - [Collection](#collection)
  - [Resource](#resource)
  - [Mixin](#mixin)
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
- Modular pluggable design with powerful composition capabilities
- Hierarchical middleware layer (inspired in [connect](https://github.com/senchalabs/connect) middleware)
- Nested configurations with powerful inheritance (based on radix tree data structure)
- Domain-specific and fluent API generation (inspired by [superagent](https://github.com/visionmedia/superagent))
- Observable hooks at any phase of the HTTP flow live cycle.
- Domain-specific API definition with built-in decorators support.
- Perfectly fitted to be used with behaviour-driven patterns based on observables.
- Request/response interceptors
- Request/response validators
- Bind bodies to custom models easily
- Supports node.js [streams](https://github.com/h2non/theon/tree/master/examples/streams.js) (HTTP adapter must support streams too)
- Supports [promises](https://github.com/h2non/theon/blob/master/examples/promise.js) (only in modern JS engines)
- Powerful HTTP fields reusability supporting hierarchical inheritance.
- Built-in HTTP context data store to persist data, such as token or session data.
- Maps HTTP entities to programmatic entities with custom logic.
- Able to persist HTTP fields shared across all requests, such as headers, cookies...
- Path params parsing and matching (with express-like path notation)
- HTTP client agnostic: use `request`, `superagent`, `jQuery` or any other HTTP agent via adapters
- Dependency free
- Designed for testability
- Lightweight: ~2K LOC (~8KB gzipped)
- Runs in browsers and node.js (ES5 compliant)

## Benefits

- Write APIs in a declarative and powerful way
- Easily create domain-specific fluent APIs
- Create API clients that are simple to use and easy to maintain
- Decouple API definition from API consumption layer
- Underline HTTP interface details from API consumers
- Map HTTP interfaces and resources to programmatic entities
- And make future changes silently from consumers' eyes.
- Use or write your own plugins to augment some specific feature
- Validate request and response params and bodies easily
- Map and bind bodies to custom models easily
- Perform pre/post operations (e.g: logging, validation, defaults...)
- Save session data based on the client state live cycle (e.g: auth tokens, sessions...)
- Minimize the boilerplate process while writing API clients
- HTTP agent agnostic: pick what you need based on the environment (`request`, `superagent`, `$.ajax`, `angular.$http` via agents)
- Ubiquitous: write one API. Run it in any JavaScript environment
- Easy to test via interceptor/mock middleware

## Installation

Via `npm`:
```bash
npm install theon --save
```

Via `bower`:
```bash
bower install theon.js --save
```

Or loading the script from CDN:
```html
<script src="//cdn.rawgit.com/h2non/theon/master/theon.js"></script>
```

## Environments

Runs in any [ES5 compliant](http://kangax.github.io/mcompat-table/es5/) engine:

![Node.js](https://cdn0.iconfinder.com/data/icons/long-shadow-web-icons/512/nodejs-48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
---  | --- | --- | --- | --- | --- |
+0.10 | +5 | +3.5 | +9 | +12 | +5 |

## Motivation

I initially wrote this library to mitigate my frustration while writing further programmatic API clients for multiple HTTP layers across JavaScript environments.

After dealing with recurrent scenarios, I realized that the process is essentially boilerplate in most cases, so then a specific solution can be conceived to simplify the process and provide a more convenient layer to do it better and faster.

In most scenarios, when you are writing APIs, you have to build a programmatic layer which maps to specific HTTP resources, usually when dealing with resource-oriented HTTP services.
With `theon` you can decouple those parts and provide a convenient abstraction between the HTTP interface details and the programmatic layer you want to provide to the API consumers.

Additionally, it provides a rich set of features to make your programmatic layer more powerful for either you as an API builder or for your API consumers through a hierarchical middleware/hook layer which allows you to plug in and compose intermediate logic.

I took some inspiration from [Google API client for node.js](https://github.com/google/google-api-nodejs-client) and in the way they are building a huge programmatic API layer, but you can probably do it even better with `theon`.

## Entities

`theon` introduces the concept of entity, which is basically an abstract object which stores and encapsulates HTTP specific protocol level data (such as headers, method, path or query params) and represents a hierarchical entity in your API structure, which is usually mapped into an HTTP resource, subresource or endpoint.

Entities hierarchy in `theon` are analogue to a [radix tree](https://en.wikipedia.org/wiki/Radix_tree) structure, providing an associative implicit linking and feature inheritance across hierarchical entities.

In order to build your API you have to understand and use the concept of entity properly, and know how to use the different built-in entities provided by `theon`.

Entities are also useful as a sort of extensibility and composition layer since you can plug in them at any level of your API. Also, entities can inherit from other entities, inheriting its functionality, configuration, middleware and hooks.

The following graph represents the relation between `theon` entities and a common HTTP REST-like endpoint:

```
   /api         /users          /id      /favorites
     ↓             ↓             ↓           ↓
  [client] + [collection] + [resource] + [resource]
     ↓             ↓             ↓           ↓
  [mixin]?      [mixin]?      [mixin]?    [mixin]?
```

### Supported Entities

#### Client

`client` represents the API client root high-level entity.
Every `theon` instance is a client entity itself, and it's mostly used as a parent container for nested entities.

Since `theon` is fully hierarchical, you can bind HTTP-specific fields, such as headers, at the client entity level. That means all the configurations attached at the client level will be inherited in child entities.

- Can inherit behavior from other `entity`, usually another `client`.
- Can host `collections` and `resources`.
- Can have `mixins`.
- Supports middleware and observable hooks.

#### Collection

`collection` represents a set of entities. It was mainly designed to store a bunch of  other `collection` or `resources`, mostly used as a sort of isolation entity to divide and compose different parts of your API.

- Can inherit behaviour from other `entity`, usually a `client`.
- Can host other `collections` or `resources`.
- Can have `mixins`.
- Cannot perform requests itself.
- Supports middleware and observable hooks.

#### Resource

`resource` is an entity designed to be attached to a specific HTTP resource, endpoint or HTTP action.
They're usually embedded as part of collections.

- Can inherit behaviour from other `entity`, usually a `collection`.
- Can host `collections`, `resource`.
- Can have `mixins`.
- Can perform requests.
- Supports middleware and observable hooks.

#### Mixin

A `mixin` is a custom user-defined function hosting any kind of logic and supporting a free arguments input.

The `mixin` entity is an analogue to its programming terminology, meaning it mostly extends a component with some specific feature as a sort of plug-in.

[Mixin example](https://github.com/h2non/theon/blob/master/examples/mixin.js).

- Can inherit behaviour from any other entity.
- Cannot host other entities.
- Cannot have other `mixins`.
- Can perform requests (either by native implementation or inheriting the client from parent entities).
- Supports middleware and observable hooks.

## Tutorial

Let's imagine we want to create a programmatic API client to interact with a remote HTTP service easily.

We have the following requirements:

- The HTTP API only uses JSON as an interchange format.
- We have to pass a header to define the API version we want to use.
- Certain resources are protected and we must pass an authorization token.

We have the following HTTP interface:

- POST /api/auth/login
- POST /api/auth/signup
- GET /api/users - `auth required`
- GET /api/users/:id - `auth required`
- POST /api/users/:id - `auth required`
- DELETE /api/users/:id - `auth required`

Firstly, as API developers, we're going to create and configure our base client using `theon`:

```js
var theon = require('theon')

var client = theon('http://my.api.com')
  .set('Version', '1.0') // Define the API version header at global level
  .basePath('/api') // We define the base path for all the requests
  .type('json') // Our payloads and responses will be always JSON
```

Then, we can start declaring the entities based on the HTTP API paths.

Let's start building the `auth` entity.
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
Let's continue declaring the `users` entity in a different collection:

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
Let's see how it was rendered and play a bit with it as end API consumers.

In the following example we're going to register a new user:
```js
api.auth
  .signup()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res, client) {
    console.log('Response:', res.statusCode, res.body)
  })
```

Now our client is authenticated, so we can try fetching the user:
```js
api.users
  .get()
   // important: we have to pass the path param
  .param('id', 1)
  // Note the don't have to explcitly pass any authentication credentials
  .end(function (err, res) {
    console.log('User:', res.body)
  })
```

Also, we can perform a user search:
```js
api.users
  .find()
  .query({ username: 'foo' })
  .end(function (err, res) {
    console.log('Search:', res.body)
  })
```

Then we want to delete the user:
```js
api.users
  .delete()
  .param('id', 123)
  .end(function (err, res) {
    console.log('Search:', res.body)
  })
```

Finally, to summarize, now our new API client provides a programmatic binding layer to the HTTP API resources, so we can draw the following relation map:

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

One of the design goals of `theon` is to make it HTTP agent agnostic, meaning it's not coupled to any specific HTTP client and runtime environment boundaries.

In other words, `theon` gives the ability developer to pick the preferred one based on its particular needs and runtime scenario, so if you're creating an API client for browsers and a particular framework, let's say AngularJS, you don't have any constraint imposed by `theon` to use the native HTTP agent natively provided by the framework.

To clarify this, it is worth saying that `theon` is not an HTTP client per se, and neither implements stuff related to the HTTP network domain, it's just an abstraction layer providing a DSL to build and configure high-level HTTP protocol-specific stuff.

So instead of implementing an HTTP client, `theon` relies on an external adapter which should be responsible for communicating with the real HTTP client, making it accessible by the proxy layer between `theon` interface and the target HTTP agent. Then all the HTTP network level stuff is completely delegated in the agent adapter. When the request is handled by the real HTTP agent, it should resolve the result properly and report it to `theon` layer.

In other to be more pragmatic, `theon` provides by default two HTTP adapters for both node.js and browser environments, but it's up to you to write your own adapter to talk with another HTTP client, such as `superagent`, `got`, `$.ajax`, `angular.$http` or any other.

#### Node.js

- [request](https://github.com/request/request) `default` - Popular and featured HTTP client
- [superagent](https://github.com/theonjs/superagent-adapter) - superagent HTTP adapter.
- [resilient](https://github.com/theonjs/resilient-adapter) - [resilient.js](https://github.com/resilient-http/resilient.js) HTTP adapter.

#### Browsers

- [lil-http](https://github.com/lil-js/http) `default` - Lightweight XHR wrapper for browsers.
- [angular](https://github.com/theonjs/angular-adapter) - Angular's $http adapter.

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

One of the main responsibilities of an HTTP agent adapter is acting as an interface mapper between `theon` scope and the target HTTP client, adapting both request and response interfaces.

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

`theon` allows you to attach plugins to any HTTP high-level entity. Plugins are useful to encapsulate common logic through a clean and simple interface in `theon` based clients.

You can see an example [here](https://github.com/h2non/theon/blob/master/examples/plugin.js).

### Third-party plugins

- [expect](https://github.com/theonjs/expect) - supertest inspired HTTP expectation for your tests.

#### Upcoming plugins

Potential upcoming plugins based on my personal needs and wishes:

- **consul** - Server discovery and balancing using Consul.
- **retry** - Provide a simple retry logic policy in your API clients.
- **JSONSchema** - Validate incoming and outgoing bodies against a JSON schema.
- **APIDocs** - Generate Swagger/Apiary docs reading the resource metadata annotations.

## Middleware

`theon` has been designed with strong extensibility capabilities in mind.
Extensibility is mostly achieved via its built-in middleware layer,
which allows you to plug in and extend the client features with custom logic.

The middleware layer has a hierarchical design, meaning you can plug in middleware in parent scopes and they will be called from child scopes. For instance, you can plug in middleware tasks to both global and resource levels. Then both middleware will be called, from top to bottom in hierarchical order, thus global will come always first.

Middleware layer behaves like a FIFO queue with control-flow capabilities, where asynchronicity is supported by default.

It was strongly inspired by the well-known middleware pattern of connect/express.

### Phases

- **request** - Dispatched before sending the request over the network
- **response** - Dispatched after the client receives the response

### API

#### Request#use(middleware)
Alias: `useRequest`

Attach a new middleware in the `request` phase.

#### Request#useEntity(middleware)
Alias: `useEntityRequest`

Attach a new middleware in the `request` phase in the current entity scope.

#### Request#useResponse(middleware)

Attach a new middleware in the `response` phase.

#### Request#useEntityResponse(middleware)

Attach a new middleware in the `response` phase in the current entity scope.

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
  .param('id', function (ctx, req) {
    return ctx.root.store('currentUserId')
  })
  .end(function (err, res) {
    console.log('Response:', res.status)
    console.log('Body:', res.body)
  })
```

See [examples/middleware.js](https://github.com/h2non/theon/tree/master/examples/middleware.js) for a working example.

## Hooks

`theon` provides a built-in layer to attach hooks to observe and manage in detail the different phases in the HTTP flow live cycle inside your client.

They have been specially designed to provide control capabilities across the different internal phases of any HTTP transaction handled internally in `theon` clients.
Furthermore, they are mostly useful for performing `pre` and `post` processing operations, such as defining default params and adapting/mapping things before they're processed by subsequent phases.

Hooks behaves like a traditional middleware, meaning you can alter, replace, intercept or even cancel any HTTP transaction at any stage.

Hooks can be attached to any entity, from client global scope to resource level.

Hooks also rely on control-flow capabilities, so you can run asynchronous tasks inside them.

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

#### Request#observeEntity(phase, hook)

Attach a new observer hook to a given phase in the current entity scope.

#### Request#before(hook)

Attach a new observer hook to the `before` phase.

#### Request#after(hook)

Attach a new observer hook to the `after` phase.

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

A validator is technically a middleware that is executed after the standard middleware call chain and it's responsible for validating the request/response objects, for instance, you can validate payloads against a JSON schema or HAR interface.

Validators can be attached to any `theon` entity and support both request/response phases.

You can use a validator to perform a validation of the request object before it's sent over the network in order to verify it has all the required parameters expected by the server, such as query params, headers, payload...

On the other hand, you can validate the response too, in order to determine if it can satisfy certain requirements on the client side (e.g: response body, error messages, headers...).

### Phases

- **request** - Validate the request object before it's sent over the network
- **response** - Validate the response object once it has been received by the client

### API

#### Request#validator(validator)

Attach a new request validator.

#### Request#entityValidator(validator)

Attach a new request validator at entity scope only.

#### Request#responseValidator(validator)

Attach a new response validator.

#### Request#responseEntityValidator(validator)

Attach a new response validator at entity scope only.

#### Validator notation

Validators have the same interface as middleware or hooks.

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

Interceptors are a useful built-in feature provided in `theon` when you need to intercept some HTTP flow.

It becomes particularly useful to mock requests while testing or to provide default responses given certain conditions.

Technically speaking it's equivalent to a middleware, so you can rely on control flow capabilities and inspect both request/response objects to determine when the traffic should be intercepted.

### Phases

- **before dial** - Executed before proceeding with the network dialling phase.

### API

#### Request#interceptor(interceptor)

Attach a new interceptor.

#### Request#entityInterceptor(interceptor)

Attach a new interceptor at entity scope only.

#### Interceptor notation

Validators have the same interface as middleware or hooks.

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

Evaluators are designed to inspect the response object and determine, given certain user-defined rules, if the request failed or not, and handle it accordingly.

By default `theon` doesn't handle error status such as `400` as a failed request, but you can use a validator to do it and behave accordingly to your needs.

### Phases

- **response** - Executed once the client received the response from the server

### API

#### Request#evaluator(evaluator)

Attach a new evaluator function.

#### Evaluator notation

Evaluators have the same interface as middleware or hooks.

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

Create a new `client` entity.

#### theon.collection(name)
Inherits from [`Entity`](#entity)

Create a new `collection` entity.

#### theon.resource(name)
Inherits from [`Entity`](#entity)

Create a new `resource` entity.

#### theon.mixin(name, fn)
Inherits from [`Entity`](#entity)

Create a new `mixin` entity.

#### theon.agents

API to manage HTTP agent adapters.

#### theon.agents.agents = { name: agentAdapterFn }

Map of agents by name and adapter function.

#### theon.agents.defaults() => `function`

Retrieve the default HTTP agent adapter based on the runtime environment.

#### theon.agents.get(name) => `function`

Retrieve an HTTP agent adapter by name.

#### theon.agents.set(agent)

Set an HTTP agent to be used by default.
All the HTTP traffic will be handled by this agent.

#### theon.agents.add(name, adapterFn)

Register a new HTTP agent adapter by name.

#### theon.Request([ ctx ])

Creates a new HTTP request instance based on the given context

#### theon.Response(req)

Creates a new HTTP response instance for the given request.

#### theon.Store([ parent ])

Creates a new data store instance, optionally inheriting from a parent store.

### Entity
Inherits from [`Request`](#request)

#### Entity#alias(name)

Add an additional entity alias name.

#### Entity#decorate(decorator)
Alias: `decorator`

Decorate entity constructor.

See [examples/decorator.js](https://github.com/h2non/theon/blob/master/examples/decorator.js) for an example.

#### Entity#collection(collection)

Attach a collection to the current entity.

#### Entity#action(action)
Alias: `resource`

Attach an action to the current entity.

#### Entity#mixin(mixin)
Alias: `helper`

Attach a mixin to the current entity.

#### Entity#useConstructor(fn)

Define a custom entity constructor function.
Only implemented for `Resource` and `Collection` entities.

#### Entity#addEntity(entity)

Attach a custom subentity.

#### Entity#getEntity(name, [ type ])
Alias: `findEntity`

Retrieves a child entity looking by name.

#### Entity#getCollection(name)
Alias: `findCollection`

Retrieves a child collection entity looking by name.

#### Entity#getResource(name)
Alias: `getAction`, `findResource`

Retrieves a child resource entity looking by name.

#### Entity#getMixin(name)
Alias: `findMixin`

Retrieves a child mixin entity looking by name.

#### Entity#getClient(name)
Alias: `findClient`

Retrieves a child client entity looking by name.

#### Entity#extend(name, value)

Extend the entity with a custom property and value.
Similar to mixins, but simpler.

#### Entity#meta(metadata)

Attach metadata to the current entity.
Mostly useful for annotations, flagging and documentation purposes.

#### Entity#render([ entity ]) => ClientEngine

Render all the entities, from current to root entity.

#### Entity#renderEntity([ entity ])

Render the current entity, without rendering parent entities.
This method is mostly used internally.

### Request([ ctx ])

#### Request#parent = `Request`

Reference to the parent `Request`, in case it has a parent node.

#### Request#root = `Request`

Reference to the parent root node, in case it has a parent node.

Internally, it walks across all the parent nodes recursively until finds the latest.

#### Request#store = `Store`

Reference to the current request `Store` instance.

#### Request#ctx = `Context`

Reference to the current request `Context` instance.

#### Request#api = `engine.Client`

Reference to the root public API client DSL generated via: `.render()`.

Useful to make public calls from nested/child entities to parent entities via the public-generated DSL.

#### Request#url(url)

Define the base URL of the server.

#### Request#path(path)

Define a URL final path value. `path` will be concatenated to `basePath`.

#### Request#basePath(path)

Define a URL-based path value.

#### Request#method(name)

HTTP method to use. Default to `GET`.

#### Request#param(name, value)

Defines a path param.

`value` argument can be a `string`, `number` or a `function` supporting the following interface:

```js
function getParam (
  ctx. theon.Content,
  req: theon.RawContext,
) String|Number
```

#### Request#params(params)

#### Request#persistParam(name, value)

#### Request#persistParams(params)

#### Request#unsetParam(name)

#### Request#setParams(params)

#### Request#query(query)

#### Request#setQuery(query)

#### Request#queryParam(name, value)

#### Request#unsetQuery(name)

#### Request#persistQueryParams(query)
Alias: `persistQuery`

#### Request#persistQueryParam(name, value)

#### Request#set(name, value)
Alias: `header`

#### Request#unset(name)

#### Request#headers(headers)

#### Request#setHeaders(headers)

#### Request#persistHeader(name, value)

#### Request#persistHeaders(headers)

#### Request#type(name)

#### Request#accepts(name)

#### Request#format(type)

#### Request#send(body)
Alias: `body`

#### Request#cookie(name, value)

#### Request#unsetCookie(name)

#### Request#auth(user, password)

#### Request#plugin(plugin)
Alias: `usePlugin`

#### Request#getPlugin(pluginName|pluginFn)

#### Request#use(middleware)
Alias: `useRequest`

#### Request#useEntity(middleware)
Alias: `useEntityRequest`

Attach a middleware restricted to the current entity scope.

#### Request#useResponse(middleware)

#### Request#useEntityResponse(middleware)

Attach a response middleware restricted to the current entity scope.

#### Request#before(middleware)

Attach a middleware as an observer hook in the before.

#### Request#after(middleware)

Attach a middleware as an observer hook in the after phase.

#### Request#observe(event, hook)

#### Request#validator(validator)
Alias: `requestValidator`

#### Request#entityValidator(validator)
Alias: `requestEntityValidator`

#### Request#entityResponseValidator(validator)

#### Request#interceptor(interceptor)

#### Request#entityInterceptor(interceptor)

#### Request#evaluator(fn)

Attach a `before response` hook to evaluate the response and determine if it's valid or not.
Useful to evaluate response status and force an error. E.g: `status` >= 400

#### Request#entityEvaluator(fn)

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

#### Request#response(fn)
Alias: `handle`

Attach a function to handle the response object in case the request is successful.

Function arguments are:

- **theon.Response**
- **theon.Request**

#### Request#end(cb)
Alias: `done`

Dispatch the request, sending it over the network.

#### Request#then(onFullfilled, onRejected)
Return: `Promise`

Promise-based interface to handle the request resolution, dispatching the request over the network, if necessary.

#### Request#catch(onRejected)
Return: `Promise`

Promise-based interface to handle the request error, dispatching the request over the network, if necessary.

#### Request#pipe(stream)

node.js stream-compatible interface to pipe writable streams with the response body.

Note that the used HTTP agent must support streams too, if not, they are ignored.

#### Request#stream(stream)
Alias: `bodyStream`

#### Request#raw() => [RawContext](#RawContext)

#### Request#clone()

#### Request#newRequest([ parent ])

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

#### RawContext#api = `engine.Client`

Reference to the root public API client DSL generated via: `.render()`.

Useful to make public calls from nested/child entities to parent entities via the public-generated DSL.

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

[travis]: http://travis-ci.org/theonjs/theon
