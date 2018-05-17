/**
 * To generate a service worker out of this config, run:
 *
 *     npx workbox-cli generateSW
 *
 */
module.exports = {
  swDest: './sw.js',
  globDirectory: '.',
  globPatterns: ['**/*.{js,css,html,svg,png}'],
  globIgnores: ['workbox-config.js', 'node_modules/**/*'],
  // This is needed to make our SPA to work offline.
  navigateFallback: 'index.html',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [{
    // Cache common github images (e.g. pptr logo).
    urlPattern: /^https:\/\/user-images\.githubusercontent\.com\/.*/,
    handler: 'staleWhileRevalidate'
  }],
};
