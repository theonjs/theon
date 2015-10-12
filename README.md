# theon [![Build Status](https://api.travis-ci.org/h2non/theon.svg?branch=master&style=flat)][travis] [![Code Climate](https://codeclimate.com/github/h2non/theon/badges/gpa.svg)](https://codeclimate.com/github/h2non/theon) [![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon)

`theon` is a lightweight JavaScript library which helps you to create in a declarative way domain-specific, extensible, elegant and fluent programmatic bindings to any HTTP layer.

**Still beta**.

## Features

- Modular pluggable design
- Hierarchical middleware layer (inspired by [connect](https://github.com/senchalabs/connect))
- Fluent and expressive API
- Nested configurations
- Domain-specific API generation
- Request/response interceptors
- Request/response validators
- Bind bodies to custom models
- Path params parsing and matching
- Generates a fluent and semantic programmatic API
- HTTP client agnostic: use `request`, `superagent`, `jQuery` or any other via adapters
- Dependency free
- Designed for testability (via mock interceptor)
- Lightweight: 16KB (~5KB gzipped)
- Runs in browsers and node.js

<!--
## How `theon` could be help me?

- Unifies logic and configuration across
- Decouples HTTP interface details from programmatic API consumers
-->

## Contents

- [Rationale](#rationale)
- [Installation](#installation)
- [Environments](#environments)
- [HTTP adapters](#http-adapters)
- [Plugins](#plugins)
- [Usage](#usage)
- [API](#api)

## Rationale

I wrote this library to mitigate my frustration while writting further programmatic API clients to HTTP APIs in JavaScript environments.

After dealing with recurrent scenarios, I realized that the process is essentially boilerplate in most cases, and a specific solution can be conceived to simplify the process and provide recurrent features to satifify common needs.

In most scenarios when creating APIs you have to build an abstract programmatic layer which maps to specific HTTP resources, mostly when dealing with REST oriented HTTP services.
With `theon` you can decouple those parts and provide a convenient abstraction between the HTTP interface details and programmatic API consumers.

Additionally, it provides a set of rich features to make you programmatic layer more powerful for either you as API builder and your API consumers, through a hierarchical middleware layer allowing you to plugin intermediate logic.

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

## HTTP adapters

#### Node.js

- [request](https://github.com/request/request) `default` - Popular and featured HTTP client

#### Browsers

- [lil-http](https://github.com/lil-js/http) `default` - Lightweight XHR wrapper for browsers

## Plugins

`to do`

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
// Render the API client: this will be the public
// interface you must expose for your API consumers
var apiClient = client.render()
```

Finally, use it as API consumer:
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

## API

### theon([ url ])

Create a new API builder.

### theon.client([ url ])
Inherits from [`Entity`](#entity)

Create a new `client` entity

### theon.collection(name)
Inherits from [`Entity`](#entity)

Create a new `collection` entity

### theon.resource(name)
Inherits from [`Entity`](#entity)

Create a new `resource` entity

### theon.mixin(name, fn)
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

#### Request#debug(opts)

#### Request#stopDebugging(opts)

#### Request#useParent(parent)

#### Request#end(cb)

#### Request#raw()

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

#### Context#useParent(ctx)

#### Context#raw()

#### Context#clone()

#### Context#buildPath()

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[travis]: http://travis-ci.org/h2non/theon
