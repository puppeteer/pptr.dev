/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "favicons/android-chrome-192x192.png",
    "revision": "05be0b0c0d82fd26e50eef9fd255f21e"
  },
  {
    "url": "favicons/android-chrome-384x384.png",
    "revision": "0b84f07f6d1a9f09b52f47dc9a744ba8"
  },
  {
    "url": "favicons/apple-touch-icon.png",
    "revision": "f993b772518d7d488b1f2f7e03908f22"
  },
  {
    "url": "favicons/favicon-16x16.png",
    "revision": "9af3980ba3ffc11ccb9b01dfbe2555b6"
  },
  {
    "url": "favicons/favicon-32x32.png",
    "revision": "e2f8da1b76492c82494e071e4c9e3d64"
  },
  {
    "url": "favicons/mstile-150x150.png",
    "revision": "203fc1bff1934f7b478c0bd2c6713854"
  },
  {
    "url": "favicons/safari-pinned-tab.svg",
    "revision": "d4e8575115db91ea0154f94a64686b08"
  },
  {
    "url": "images/checkmark.svg",
    "revision": "094c946e202c6b49672d422f3c50307f"
  },
  {
    "url": "images/close.svg",
    "revision": "e22e537e8340ffc1ab24bfe61956644f"
  },
  {
    "url": "images/cog.svg",
    "revision": "767280f704baffa60642f681d490ca3b"
  },
  {
    "url": "images/github.png",
    "revision": "d56df49a807a9fd06eb1667a84d3810e"
  },
  {
    "url": "images/home.svg",
    "revision": "5a5d43fb5504cd8984e4e59f1832ee3e"
  },
  {
    "url": "images/menu.svg",
    "revision": "6aa1bfbadbdeb0e73c5c945c2dbc0019"
  },
  {
    "url": "images/pptr.png",
    "revision": "924f28bd0281fb8e45b19f1364cfaf8e"
  },
  {
    "url": "images/search.svg",
    "revision": "69536ad6f996355f6c73270a0c018ac8"
  },
  {
    "url": "images/slack.svg",
    "revision": "9619ac706025ffb434bd25df418e5591"
  },
  {
    "url": "images/stackoverflow.svg",
    "revision": "4f62b6320d08038f64406b39f3943108"
  },
  {
    "url": "images/wrench.svg",
    "revision": "dba7613975ea6b812b22d6a6c8f74db7"
  },
  {
    "url": "index.html",
    "revision": "7e05cb0487a75d0fc0dc3d4c2a3cb562"
  },
  {
    "url": "pptr/APIDocumentation.js",
    "revision": "bbf5aa37882527f4cbb6bfb11d7fbfdc"
  },
  {
    "url": "pptr/PPTRProduct.js",
    "revision": "3a48f366460848e2f4ddbd7cc281148c"
  },
  {
    "url": "pptr/style.css",
    "revision": "81692f1f5a51e4d50d212f5bc68812a3"
  },
  {
    "url": "src/App.js",
    "revision": "45dd74e36723d078ff6a1fd09b78d4d8"
  },
  {
    "url": "src/content-component.css",
    "revision": "590bfe05cd7b0ef7c2439f1a4d6bfd4b"
  },
  {
    "url": "src/ContentComponent.js",
    "revision": "df7c8ce5352cc85e37a1b3fd18e7ce27"
  },
  {
    "url": "src/EventEmitter.js",
    "revision": "826dd87509464bbf4f1d3a3881bd77d7"
  },
  {
    "url": "src/FuzzySearch.js",
    "revision": "3d28bbb154c2f9cacab39d897a47b010"
  },
  {
    "url": "src/main.css",
    "revision": "a863165abae17d35b8cae2713b1ee220"
  },
  {
    "url": "src/polyfills.js",
    "revision": "4abe9576e05d4e78c0b6a018da751725"
  },
  {
    "url": "src/search-component.css",
    "revision": "b0eda28e072367337371141c4a6a4798"
  },
  {
    "url": "src/SearchComponent.js",
    "revision": "6e28d58016847e26b3115efac3bc7cf4"
  },
  {
    "url": "src/settings-component.css",
    "revision": "295c1816f1c9e54f99c9dbb5385342eb"
  },
  {
    "url": "src/SettingsComponent.js",
    "revision": "14055ba62f7ef4cb5565f4c7e8f0851b"
  },
  {
    "url": "src/sidebar-component.css",
    "revision": "82ce3f13fafe662b66273e69776c17ad"
  },
  {
    "url": "src/SidebarComponent.js",
    "revision": "7ba57459acb4b00bea1312672ed0844a"
  },
  {
    "url": "src/toolbar-component.css",
    "revision": "941fb2992258726f6574dee7e46e7174"
  },
  {
    "url": "src/ToolbarComponent.js",
    "revision": "42ca3e594d93754827027576f43e5377"
  },
  {
    "url": "third_party/commonmark.min.js",
    "revision": "0e0062737ba6abed162bdf4fbac56daa"
  },
  {
    "url": "third_party/javascript.js",
    "revision": "1166617a4fac58389ace5c278968931d"
  },
  {
    "url": "third_party/runmode-standalone.js",
    "revision": "37de3169e8a5c5e83c3276c2a6026b89"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute("index.html");

workbox.routing.registerRoute(/^https:\/\/user-images\.githubusercontent\.com\/.*/, workbox.strategies.staleWhileRevalidate(), 'GET');
