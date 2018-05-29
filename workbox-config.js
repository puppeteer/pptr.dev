/**
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
