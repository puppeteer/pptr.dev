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
    "url": "images/pptr.png",
    "revision": "924f28bd0281fb8e45b19f1364cfaf8e"
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
    "revision": "8a727816f0b70afcd51acacfe4f8fdcc"
  },
  {
    "url": "pptr/APIDocumentation.js",
    "revision": "ee43b24635bb79b55c92c4ada3d6f3d5"
  },
  {
    "url": "pptr/PPTRProduct.js",
    "revision": "3cdba103ee920575193ad5cd4c90a93a"
  },
  {
    "url": "pptr/style.css",
    "revision": "80385cd179d8701236ece5b01d51d69a"
  },
  {
    "url": "src/App.js",
    "revision": "c4c0e3fc80ec5af6083517326fcc9c41"
  },
  {
    "url": "src/content-component.css",
    "revision": "ab03f9dbf93629e32b109a0e3de6d8d7"
  },
  {
    "url": "src/ContentComponent.js",
    "revision": "7fe9db8bba0ecf0e0cd52f4ed2e12222"
  },
  {
    "url": "src/EventEmitter.js",
    "revision": "d683e1e2369dc73f326f633d686b6048"
  },
  {
    "url": "src/FuzzySearch.js",
    "revision": "3e4337a91a77f09e3759dd6ccec61299"
  },
  {
    "url": "src/main.css",
    "revision": "46881b17a912037a2cf240ba22208d8d"
  },
  {
    "url": "src/polyfills.js",
    "revision": "af16e7f55535a8dbbb30e730b8adb7a0"
  },
  {
    "url": "src/search-component.css",
    "revision": "0d058ac11c3e6ddeb07e0132996edcae"
  },
  {
    "url": "src/SearchComponent.js",
    "revision": "26bf58b9c38575ab2f7d4d952b1af5eb"
  },
  {
    "url": "src/settings-component.css",
    "revision": "b7b8c10b644d4ff7dde2b07ef57e084e"
  },
  {
    "url": "src/SettingsComponent.js",
    "revision": "a02aedebb90d9435f694d72b89f5f001"
  },
  {
    "url": "src/sidebar-component.css",
    "revision": "14942463e7b3c5c55bae4acd6f0adc55"
  },
  {
    "url": "src/SidebarComponent.js",
    "revision": "371d7ad03450b580928cfd8d1d0c0af1"
  },
  {
    "url": "src/toolbar-component.css",
    "revision": "84a0094f7c19bf548d1cc985de1343b8"
  },
  {
    "url": "src/ToolbarComponent.js",
    "revision": "09495d00fce63f556b16241964478c65"
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
