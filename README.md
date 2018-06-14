# https://pptr.dev

This repository contains source code for https://pptr.dev website.

## How it works

`pptr.dev` doesn't have any server side part. All the data is fetched dynamically from NPM and GitHub via XHRs.

On the first load, `pptr.dev`:
- fetches puppeteer releases from NPM
- fetches `docs/api.md` for every release
- caches all the loaded data locally

On a subsequent load, `pptr.dev` occasionally invalidates cached documentation and releases.

## Building and Running

1. To run debug version, use `npm run serve` and navigate browser to `http://localhost:8887`.
2. To run prod version, use `npm run build && npm run prod` and then navigate browser to `http://localhost:8888`

> **NOTE** Debug version of `pptr.dev` doesn't require any build steps; serving [`index.html`](https://github.com/GoogleChromeLabs/pptr.dev/blob/master/index.html) with any static server
is sufficient.

> **NOTE** Debug version of `pptr.dev` doesn't include service worker to simplify development

## Dependencies

- [commonmark.js](https://github.com/commonmark/commonmark.js/) is used to parse and render markdown documentation
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) is used to work with IndexedDB
- [codemirror](http://codemirror.com/) is used to highlight code snippets inside markdown

## FAQ

#### Q: Does pptr.dev use Custom Elements?

No. `pptr.dev` creates HTML elements with descriptive names to make markup nicer; this approach works in old browsers as well.
