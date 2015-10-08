# theon [![Build Status](https://api.travis-ci.org/h2non/theon.svg?branch=master&style=flat)][travis] [![Code Climate](https://codeclimate.com/github/h2non/theon/badges/gpa.svg)](https://codeclimate.com/github/h2non/theon)

<!--
[![NPM](https://img.shields.io/npm/v/theon.svg)](https://www.npmjs.org/package/theon)
-->

`theon` is a lightweight JavaScript library to easily create domain-specific, extensible, pluggable, fluent and expressive programmatic bindings to any HTTP layer.

In other words, you can essentially build a featured API clients to remote HTTP services.

**This is much a work in progress**.

## Features

- Modular pluggable design
- Hierarchical middleware layer (inspired in connect)
- Fluent and expressive API
- Nested configurations
- Domain-specific API generator
- Request/response interceptors
- Request/response validators
- Bind bodies to models
- Path params parsing and matching
- HTTP agent agnostic: use request, superagent, jQuery or any other via adapters
- Dynamic programmatic API generation
- Dependency free
- Lightweight: 16KB (~5KB gzipped)
- Cross-environment: runs in browsers and node.js

## Rationale

I wrote this library to mitigate my personal frustration and needs while writting further HTTP API clients in JavaScript environments.

After dealing with recurrent scenarios, I realized that the process is essentially boilerplate in most cases, and some solution could be  conceived to simplify that and support common needs, providing a convenient way to create programmatic bindings to HTTP layers.

After a bit of thinking, travels to the toilet and a sort of human empathy, theon borns. Hopefully it can mitigate your frustration as well, making your life a bit easy and enjoyable.

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

In order to provide a straightforward programmatic API like this:
```js
myapi.users
  .find()
  .query({ limit: 50 })
  .end(function (err, res) { ... })

myapi.auth
  .signup()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res) { ... })

myapi.wallet
  .create()
  .send({ username: 'foo', password: 'b@r' })
  .end(function (err, res) { ... })
```

Using `theon` you can write:
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

// Render the API client: this will be the public
// interface you must expose for your API consumers
var apiClient = client.render()

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
  .param('id', 123)
  .end(function (err, res) {
    console.log('Response:', res.statusCode)
    console.log('Body:', res.body)
  })
```

## API

`to do`

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[travis]: http://travis-ci.org/h2non/theon
