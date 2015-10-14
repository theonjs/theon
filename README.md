# theon [![Build Status](https://api.travis-ci.org/h2non/theon.svg?branch=master&style=flat)][travis] [![Code Climate](https://codeclimate.com/github/h2non/theon/badges/gpa.svg)](https://codeclimate.com/github/h2non/theon) [![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon)

A lightweight, declarative and [featured](#features) JavaScript library which helps you to create domain-specific, extensible, expressive and fluent programmatic bindings to any HTTP layer (e.g: API clients, SDKs...).

`theon` was mainly designed to simplify and minimize the boilerplate process when writting API clients for HTTP services. Just write one API. Run it everywhere.

To get started, you can take a look to [usage instructions](#usage), [examples](https://github.com/h2non/theon/tree/master/examples) and [API](#api) docs.

**Still beta**.

## Contents

- [Features](#features)
- [Benefits](#benefits)
- [Motivation](#motivation)
- [Concepts](concepts)
- [Installation](#installation)
- [Environments](#environments)
- [Usage](#usage)
- [HTTP adapters](#http-agent-adapters)
- [Middleware](#middleware)
- [Validator](#validator)
- [API](#api)

<!-- - [Plugins](#plugins) -->

## Features

- Simple and declarative API
- Modular pluggable design
- Hierarchical middleware layer (inspired by [connect](https://github.com/senchalabs/connect))
- Nested configurations based on inheritance
- Domain-specific API generation
- Request/response interceptors (via middleware)
- Request/response validators
- Bind bodies to custom models
- Path params parsing and matching
- Generates a fluent and semantic programmatic API
- HTTP client agnostic: use `request`, `superagent`, `jQuery` or any other via adapters
- Dependency free
- Designed for testability (via interceptor middleware)
- Lightweight: 16KB (~5KB gzipped)
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
- Can perform requests

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

Define your API
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

Then render it:
```js
// Rending the API will create and expose the public
// interface ready to be used by your API consumers
var apiClient = client.render()
```

Use the API as end consumer:
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

## HTTP agent adapters

#### Node.js

- [request](https://github.com/request/request) `default` - Popular and featured HTTP client

#### Browsers

- [lil-http](https://github.com/lil-js/http) `default` - Lightweight XHR wrapper for browsers

### Writting adapters

`to do`

<!--
## Plugins

`to do`
-->

## Middleware

### Phases

### API

### Writting a middleware

## Validator

### Phases

### API

### Writting a validator

## API

### theon([ url ])

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

#### Request#send(body)
Alias: `body`

#### Request#cookie(name, value)

#### Request#unsetCookie(name)

#### Request#auth(user, password)

#### Request#use(middleware)
Alias: `useRequest`

#### Request#useResponse(middleware)

#### Request#validator(validator)
Alias: `requestValidator`

#### Request#responseValidator(validator)

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

#### RawContext#opts = `object`

#### RawContext#agent = `function`

#### RawContext#agentOpts = `object`

#### RawContext#ctx = `Context`

Current context reference.

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
