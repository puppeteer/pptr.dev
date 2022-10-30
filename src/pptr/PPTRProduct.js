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
import {Store as IDBStore, get as idbGet, set as idbSet} from '../third_party/idb-keyval.mjs';

import {APIDocumentation, APISection, APIMethod, APIClass} from './APIDocumentation.js';
import {App} from '../ui/App.js';
import {html} from '../ui/html.js';
import {SearchComponent} from '../ui/SearchComponent.js';

const LOCAL_STORAGE_KEY = 'pptr-api-data';
const PRODUCT_NAME = 'Puppeteer';

// See Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
// And pptr.dev bug: https://github.com/GoogleChromeLabs/pptr.dev/issues/3
function isFirefoxPrivateBrowsingMode() {
  if (!('MozAppearance' in document.documentElement.style))
    return Promise.resolve(false);

  const db = indexedDB.open('test');
  return new Promise(resolve => {
    db.onerror = resolve.bind(null, true);
    db.onsuccess = resolve.bind(null, false);
  });
}

export class PPTRProduct extends App.Product {
  static async fetchReleaseAndReadme(staleData) {
    const fetchTimestamp = Date.now();
    const [ readmeText ] = await Promise.all([
      fetch('https://raw.githubusercontent.com/GoogleChrome/puppeteer/main/README.md').then(r => r.text()),
    ]);
    // Hard-code all releases 
    const releases = [
      { name: "v15.2.0", timestamp: new Date("2022-06-29T12:26:01.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v15.1.1", timestamp: new Date("2022-06-25T11:33:56.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v15.1.0", timestamp: new Date("2022-06-24T16:42:48.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v15.0.2", timestamp: new Date("2022-06-24T13:30:53.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v15.0.1", timestamp: new Date("2022-06-24T07:42:26.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v15.0.0", timestamp: new Date("2022-06-23T11:38:41.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.4.1", timestamp: new Date("2022-06-17T13:29:39.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.4.0", timestamp: new Date("2022-06-13T21:06:10.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.3.0", timestamp: new Date("2022-06-07T14:21:59.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.2.1", timestamp: new Date("2022-06-02T13:39:04.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.2.0", timestamp: new Date("2022-06-01T20:12:15.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.1.2", timestamp: new Date("2022-05-30T14:29:08.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.1.1", timestamp: new Date("2022-05-19T15:00:05.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.1.0", timestamp: new Date("2022-05-13T07:34:06.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v14.0.0", timestamp: new Date("2022-05-09T13:31:25.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.7.0", timestamp: new Date("2022-04-28T11:06:55.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.6.0", timestamp: new Date("2022-04-20T08:09:53.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.5.2", timestamp: new Date("2022-03-31T09:11:44.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.5.1", timestamp: new Date("2022-03-09T13:25:35.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.5.0", timestamp: new Date("2022-03-07T13:24:25.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.4.1", timestamp: new Date("2022-03-01T07:30:04.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.4.0", timestamp: new Date("2022-02-22T12:35:20.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.3.2", timestamp: new Date("2022-02-14T11:36:33.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.3.1", timestamp: new Date("2022-02-10T15:02:29.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.3.0", timestamp: new Date("2022-02-09T17:35:31.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.2.0", timestamp: new Date("2022-02-07T14:36:49.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.1.3", timestamp: new Date("2022-01-31T09:17:18.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.1.2", timestamp: new Date("2022-01-25T07:56:59.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.1.1", timestamp: new Date("2022-01-18T08:56:21.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.1.0", timestamp: new Date("2022-01-17T14:42:30.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.0.1", timestamp: new Date("2021-12-22T08:07:36.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v13.0.0", timestamp: new Date("2021-12-10T09:11:03.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v12.0.1", timestamp: new Date("2021-11-29T20:09:12.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v12.0.0", timestamp: new Date("2021-11-27T16:09:30.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v11.0.0", timestamp: new Date("2021-11-03T09:26:53.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v10.4.0", timestamp: new Date("2021-09-21T15:32:18.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v10.2.0", timestamp: new Date("2021-08-04T12:51:02.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v10.1.0", timestamp: new Date("2021-06-29T07:27:53.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v10.0.0", timestamp: new Date("2021-05-31T12:40:13.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v9.1.1",  timestamp: new Date("2021-05-05T08:40:11.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v9.1.0",  timestamp: new Date("2021-05-03T12:11:02.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v9.0.0",  timestamp: new Date("2021-04-21T11:25:02.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v8.0.0",  timestamp: new Date("2021-02-26T08:34:28.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.1.0",  timestamp: new Date("2021-02-12T10:55:49.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.0.4",  timestamp: new Date("2021-02-09T12:35:19.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.0.3",  timestamp: new Date("2021-02-09T08:51:39.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.0.2",  timestamp: new Date("2021-02-09T08:28:06.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.0.1",  timestamp: new Date("2021-02-04T10:16:53.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v7.0.0",  timestamp: new Date("2021-02-03T15:35:59.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v6.0.0",  timestamp: new Date("2021-02-02T11:05:06.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.5.0",  timestamp: new Date("2020-11-16T13:39:47.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.4.1",  timestamp: new Date("2020-10-27T15:05:56.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.4.0",  timestamp: new Date("2020-10-23T15:08:01.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.3.1",  timestamp: new Date("2020-09-22T10:56:36.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.3.0",  timestamp: new Date("2020-09-11T08:56:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.2.1",  timestamp: new Date("2020-07-21T14:33:12.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.2.0",  timestamp: new Date("2020-07-17T12:36:03.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.1.0",  timestamp: new Date("2020-07-13T08:32:39.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v5.0.0",  timestamp: new Date("2020-07-02T13:33:31.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v4.0.1",  timestamp: new Date("2020-06-24T13:23:26.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v4.0.0",  timestamp: new Date("2020-06-15T13:51:59.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.3.0",  timestamp: new Date("2020-06-02T08:59:38.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.2.0",  timestamp: new Date("2020-05-29T09:23:48.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.1.0",  timestamp: new Date("2020-05-18T11:49:42.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.0.4",  timestamp: new Date("2020-05-07T10:02:06.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.0.3",  timestamp: new Date("2020-05-06T15:01:11.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.0.2",  timestamp: new Date("2020-04-28T09:26:45.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.0.1",  timestamp: new Date("2020-04-22T14:41:07.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v3.0.0",  timestamp: new Date("2020-04-16T09:13:44.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v2.1.1",  timestamp: new Date("2020-02-05T13:42:00.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v2.1.0",  timestamp: new Date("2020-01-28T06:06:32.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v2.0.0",  timestamp: new Date("2019-10-24T13:10:27.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.20.0", timestamp: new Date("2019-09-13T07:41:02.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.19.0", timestamp: new Date("2019-07-23T05:04:49.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.18.1", timestamp: new Date("2019-06-26T17:41:13.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.18.0", timestamp: new Date("2019-06-20T22:15:59.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.17.0", timestamp: new Date("2019-05-24T00:13:55.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.16.0", timestamp: new Date("2019-05-13T22:18:42.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.15.0", timestamp: new Date("2019-04-26T02:26:36.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.14.0", timestamp: new Date("2019-03-29T05:34:38.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.13.0", timestamp: new Date("2019-03-05T02:40:19.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.12.2", timestamp: new Date("2019-02-05T19:38:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.12.1", timestamp: new Date("2019-02-01T20:32:21.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.12.0", timestamp: new Date("2019-02-01T03:39:32.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.11.0", timestamp: new Date("2018-11-30T06:13:46.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.10.0", timestamp: new Date("2018-11-02T03:10:21.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.9.0",  timestamp: new Date("2018-10-04T21:38:23.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.8.0",  timestamp: new Date("2018-09-06T20:53:37.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.7.0",  timestamp: new Date("2018-08-10T01:56:00.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.6.2",  timestamp: new Date("2018-08-01T20:41:49.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.6.1",  timestamp: new Date("2018-07-24T18:19:37.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.6.0",  timestamp: new Date("2018-07-13T00:31:25.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.5.0",  timestamp: new Date("2018-06-07T19:22:13.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.4.0",  timestamp: new Date("2018-05-09T05:13:09.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.3.0",  timestamp: new Date("2018-04-13T18:05:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.2.0",  timestamp: new Date("2018-03-16T02:20:56.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.1.1",  timestamp: new Date("2018-02-24T06:09:54.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.1.0",  timestamp: new Date("2018-02-16T17:17:30.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.0.0",  timestamp: new Date("2018-01-12T03:52:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.13.0", timestamp: new Date("2017-11-11T02:26:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.2.0",  timestamp: new Date("2018-03-16T02:20:56.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.1.1",  timestamp: new Date("2018-02-24T06:09:54.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.1.0",  timestamp: new Date("2018-02-16T17:17:30.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v1.0.0",  timestamp: new Date("2018-01-12T03:52:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.13.0", timestamp: new Date("2017-11-11T02:26:58.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.12.0", timestamp: new Date("2017-10-14T16:58:57.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.11.0", timestamp: new Date("2017-09-21T05:46:44.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.10.2", timestamp: new Date("2017-09-02T04:06:34.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.10.1", timestamp: new Date("2017-08-26T02:44:11.000Z").getTime(), releaseNotes: '', apiText: '' },
      { name: "v0.10.0", timestamp: new Date("2017-08-25T01:23:37.000Z").getTime(), releaseNotes: '', apiText: '' },
    ]
    // Add initial release - was published as a tag.
    releases.push({ name: 'v0.9.0', timestamp: (new Date('August 16, 2017')).getTime(), releaseNotes: '', apiText: '' });

    // Initialize release priorities that define their sorting order.
    for (const release of releases) {
      const [major, minor, patch] = release.name.substring(1).split('.').map(e => parseInt(e, 10));
      release.priority = major * 100 * 100 + minor * 100 + patch;
    }

    releases.sort((a, b) => b.priority - a.priority);

    // Fulfill api.md for every release using staleData, if any.
    if (staleData) {
      const staleAPITexts = new Map(staleData.releases.map(release => [release.name, release.apiText]));
      for (const release of releases)
        release.apiText = staleAPITexts.get(release.name);
    }

    // Fill predefined chromium versions for past releases:
    // If the regex parse would fail version pairs can be retrieved from: https://github.com/puppeteer/puppeteer/blob/main/versions.js
    // or https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteer-api-tip-of-tree
    for (const release of releases) {
      if (release.name === 'v0.9.0') {
        release.chromiumVersion = 'Chromium 62.0.3188.0 (r494755)';
      } else if (release.name === 'v0.10.0' || release.name === 'v0.10.1') {
        release.chromiumVersion = 'Chromium 62.0.3193.0 (r496140)';
      } else if (release.name === 'v0.13.0') {
        release.chromiumVersion = 'Chromium 64.0.3265.0 (r515411)';
      } else if (release.name === 'v1.1.0' || release.name === 'v1.1.1') {
        release.chromiumVersion = 'Chromium 66.0.3347.0 (r536395)';
      } else if (release.name === 'v1.3.0') {
        release.chromiumVersion = 'Chromium 67.0.3392.0 (r536395)';
      } else if (release.name === 'v5.1.0') {
        release.chromiumVersion = 'Chromium 84.0.4147.0 (r768783)';
      } else if (release.name === 'v5.5.0') {
        release.chromiumVersion = 'Chromium 88.0.4298.0 (r818858)';
      } else if (release.name === 'v6.0.0') {
        release.chromiumVersion = 'Chromium 89.0.4389.0 (r843427)';
      } else if (release.name === 'v7.0.0') {
        release.chromiumVersion = 'Chromium 90.0.4403.0 (r848005)';
      } else if (release.name === 'v8.0.0') {
        release.chromiumVersion = 'Chromium 90.0.4427.0 (r856583)';
      }
    }

    // Add tip-of-tree version.
    releases.unshift({
      name: 'main',
      chromiumVersion: 'N/A',
      releaseNotes: '',
      apiText: ''
    });

    // Parse chromium versions from release notes, where possible.
    for (const release of releases) {
      if (!release.releaseNotes || release.chromiumVersion)
        continue;
      const match = release.releaseNotes.match(/Chromium\s+(\d+\.\d+.\d+.\d+)\s*\((r\d{6})\)/i);
      if (match)
        release.chromiumVersion = `Chromium ${match[1]} (${match[2]})`;
      else
        release.chromiumVersion = 'N/A'
    }

    // Download api.md for every release.
    // Forcefully re-download it for "main" release.
    await Promise.all(releases.map(async release => {
      if (release.name === 'main' || !release.apiText)
        release.apiText = await fetch(`https://raw.githubusercontent.com/GoogleChrome/puppeteer/${release.name}/docs/api.md`).then(r => r.text())
    }));
    return {fetchTimestamp, readmeText, releases};
  }

  static async create(productVersion) {
    const store = new IDBStore('pptr-db', 'pptr-store')
    const isFFPB = await isFirefoxPrivateBrowsingMode();
    let data = await storageGet(LOCAL_STORAGE_KEY);
    const hasRequiredProductVersion = productVersion ? data && !!data.releases.find(release => release.name === productVersion) : true;

    if (!data || !hasRequiredProductVersion) {
      const message = data ? 'Downloading Puppeteer release ' + productVersion : 'Please give us a few seconds to download Puppeteer releases for the first time.\n Next time we\'ll do it in background.';
      app.setLoadingScreen(true, message);
      data = await PPTRProduct.fetchReleaseAndReadme(data);
      await storageSet(LOCAL_STORAGE_KEY, data);
      app.setLoadingScreen(false);
    } else if (Date.now() - data.fetchTimestamp > 5 * 60 * 1000 /* 5 minutes */) {
      // Kick off update process in the background.
      PPTRProduct.fetchReleaseAndReadme(data).then(data => storageSet(LOCAL_STORAGE_KEY, data));
    }
    return new PPTRProduct(data.readmeText, data.releases, data.fetchTimestamp);

    async function storageGet(key, data) {
      if (isFFPB)
        return JSON.parse(localStorage.getItem(key));
      return idbGet(LOCAL_STORAGE_KEY, store);
    }

    async function storageSet(key, value) {
      if (isFFPB)
        return localStorage.setItem(key, JSON.stringify(value));
      return idbSet(LOCAL_STORAGE_KEY, value, store);
    }
  }

  constructor(readmeText, releases, fetchTimestamp) {
    super();
    this._readmeText = readmeText;
    this._releases = releases;
    this._fetchTimestamp = fetchTimestamp;
    this._initializeAPILifespan();
  }

  toolbarElements() {
    function iconButton(linkURL, iconURL, iconClass) {
      return html`<a class=${iconClass} href="${linkURL}"><img src="${iconURL}"></img></a>`;
    }

    return [
      iconButton('https://stackoverflow.com/questions/tagged/puppeteer', './images/stackoverflow.svg', 'pptr-stackoverflow'),
      iconButton('https://github.com/GoogleChrome/puppeteer/blob/main/docs/troubleshooting.md', './images/wrench.svg', 'pptr-troubleshooting'),
      iconButton('https://github.com/GoogleChrome/puppeteer', './images/github.png', 'pptr-github'),
    ];

  }

  _initializeAPILifespan() {
    // Compute "since" and "until" versions for API entities.
    const classRegex = /### class:\s+(\w+)\s*$/;
    const eventRegex = /#### event:\s+'(\w+)'\s*$/;
    const methodRegex = /#### \w+\.([\w$]+)\(/;
    const nsRegex = /#### \w+\.(\w+)\s*$/;

    for (const release of this._releases) {
      release.classesLifespan = new Map();
      let classOutline = null;
      const titles = release.apiText.split('\n').filter(line => line.startsWith('###'));
      for (const title of titles) {
        // Handle classes
        if (classRegex.test(title)) {
          if (classOutline)
            release.classesLifespan.set(classOutline.name, classOutline);
          const className = title.match(classRegex)[1];
          classOutline = {
            name: className,
            since: release.name,
            until: '',
            // Maps of name -> first introduced version
            eventsSince: new Map(),
            methodsSince: new Map(),
            namespacesSince: new Map(),
            // Maps of name -> first removed version
            eventsUntil: new Map(),
            methodsUntil: new Map(),
            namespacesUntil: new Map(),
          };
        } else if (eventRegex.test(title)) {
          console.assert(classOutline);
          const eventName = title.match(eventRegex)[1];
          classOutline.eventsSince.set(eventName, release.name);
        } else if (methodRegex.test(title)) {
          console.assert(classOutline);
          const methodName = title.match(methodRegex)[1];
          classOutline.methodsSince.set(methodName, release.name);
        } else if (nsRegex.test(title)) {
          console.assert(classOutline);
          const nsName = title.match(nsRegex)[1];
          classOutline.namespacesSince.set(nsName, release.name);
        }
      }
      if (classOutline)
        release.classesLifespan.set(classOutline.name, classOutline);
    }

    // Compute "since" for classes, methods, namespaces and events.
    for (let i = this._releases.length - 2; i >= 0; --i) {
      const previousRelease = this._releases[i + 1];
      const release = this._releases[i];
      for (const [className, classOutline] of release.classesLifespan) {
        const previousClassOutline = previousRelease.classesLifespan.get(className);
        if (!previousClassOutline)
          continue;
        classOutline.since = previousClassOutline.since;
        for (const [eventName, since] of previousClassOutline.eventsSince) {
          if (classOutline.eventsSince.has(eventName))
            classOutline.eventsSince.set(eventName, since);
        }
        for (const [methodName, since] of previousClassOutline.methodsSince) {
          if (classOutline.methodsSince.has(methodName))
            classOutline.methodsSince.set(methodName, since);
        }
        for (const [namespaceName, since] of previousClassOutline.namespacesSince) {
          if (classOutline.namespacesSince.has(namespaceName))
            classOutline.namespacesSince.set(namespaceName, since);
        }
      }
    }
    // Compute "until" for classes, methods, namespaces and events.
    for (let i = 0; i < this._releases.length - 1; ++i) {
      const nextRelease = this._releases[i];
      const release = this._releases[i + 1];
      for (const [className, classOutline] of release.classesLifespan) {
        const nextReleaseOutline = nextRelease.classesLifespan.get(className);
        if (!nextReleaseOutline) {
          classOutline.until = nextRelease.name;
          for (const eventName of classOutline.eventsUntil.keys())
            classOutline.eventsUntil.set(eventName, nextRelease.name);
          for (const methodName of classOutline.methodsUntil.keys())
            classOutline.methodsUntil.set(methodName, nextRelease.name);
          for (const namespaceName of classOutline.namespacesUntil.keys())
            classOutline.namespacesUntil.set(namespaceName, nextRelease.name);
          continue;
        }
        classOutline.until = nextReleaseOutline.until;
        for (const eventName of classOutline.eventsSince.keys()) {
          if (nextReleaseOutline.eventsUntil.has(eventName))
            classOutline.eventsUntil.set(eventName, nextReleaseOutline.eventsUntil.get(eventName));
          else if (!nextReleaseOutline.eventsSince.has(eventName))
            classOutline.eventsUntil.set(eventName, nextRelease.name);
        }
        for (const methodName of classOutline.methodsSince.keys()) {
          if (nextReleaseOutline.methodsUntil.has(methodName))
            classOutline.methodsUntil.set(methodName, nextReleaseOutline.methodsUntil.get(methodName));
          else if (!nextReleaseOutline.methodsSince.has(methodName))
            classOutline.methodsUntil.set(methodName, nextRelease.name);
        }
        for (const namespaceName of classOutline.namespacesSince.keys()) {
          if (nextReleaseOutline.namespacesUntil.has(namespaceName))
            classOutline.namespacesUntil.set(namespaceName, nextReleaseOutline.namespacesUntil.get(namespaceName));
          else if (!nextReleaseOutline.namespacesSince.has(namespaceName))
            classOutline.namespacesUntil.set(namespaceName, nextRelease.name);
        }
      }
    }
  }

  name() {
    return PRODUCT_NAME;
  }

  defaultVersionName() {
    return this._releases[1].name;
  }

  versionNames() {
    return this._releases.map(release => release.name);
  }

  /**
   * @return {!Array<!{name: string, description: string}>}
   */
  versionDescriptions() {
    const descriptions = this._releases.map(release => {
      return {
        name: release.name,
        description: release.chromiumVersion,
        date: release.timestamp ? new Date(release.timestamp) : null,
      };
    });
    return descriptions;
  }

  settingsFooterElement() {
    const diff = Date.now() - this._fetchTimestamp;
    let time = '';
    if (diff < 1000)
      time = 'Just Now';
    else if (1000 <= diff && diff <= 60 * 1000)
      time = `${Math.round(diff / 1000)} seconds ago`;
    else if (60 * 1000 <= diff && diff <= 60 * 60 * 1000)
      time = `${Math.round(diff / 60 / 1000)} minutes ago`;
    else if (60 * 60 * 1000 <= diff && diff <= 24 * 60 * 60 * 1000)
      time = `${Math.round(diff / 60 / 60 / 1000)} hours ago`;
    else if (24 * 60 * 60 * 1000 <= diff)
      time = `${Math.round(diff / 24 / 60 / 60 / 1000)} days ago`;
    return html`<pptr-settings-footer>Data fetched ${time}</pptr-settings-footer>`;
  }

  create404(title = '') {
    const element = html`
      <pptr-api class=pptr-not-found>
        <content-box>
          <h1>Not Found</h1>
          <p>${title}</p>
          <p><a href='${app.linkURL(PRODUCT_NAME, this.defaultVersionName())}'>Home</a></p>
        </content-box>
      </pptr-api>
    `;
    return {element, title: 'Not Found'};
  }

  getVersion(name) {
    const release = this._releases.find(release => release.name === name);
    if (!release)
      return null;
    return new PPTRVersion(this._readmeText, release);
  }
}

class PPTRVersion extends App.ProductVersion {
  constructor(readmeText, {name, releaseNotes, apiText, classesLifespan}) {
    super();
    this._name = name;
    this._readmeText = readmeText;

    this.api = APIDocumentation.create(name, releaseNotes, apiText, classesLifespan);

    this._sidebarElements = [];
    this._entryToSidebarElement = new Map();
    this._initializeSidebarElements();

    this._searchItems = [];
    for (const apiClass of this.api.classes) {
      this._searchItems.push(PPTRSearchItem.createForClass(apiClass));
      for (const apiEvent of apiClass.events)
        this._searchItems.push(PPTRSearchItem.createForEvent(apiEvent));
      for (const apiNamespace of apiClass.namespaces)
        this._searchItems.push(PPTRSearchItem.createForNamespace(apiNamespace));
      for (const apiMethod of apiClass.methods)
        this._searchItems.push(PPTRSearchItem.createForMethod(apiMethod));
    }

  }

  name() {
    return this._name;
  }

  searchItems() {
    return this._searchItems;
  }

  sidebarElements() {
    return this._sidebarElements;
  }

  toolbarElements() {
    return this._toolbarElements;
  }

  content(contentId) {
    if (!contentId) {
      const element = html`
        <pptr-api class=pptr-readme>
          <content-box>
            ${Array.from(APIDocumentation.markdownToDOM(this._readmeText).childNodes)}
          </content-box>
        </pptr-api>
      `;
      // Move logo to the very beginning - it will look better.
      const logo = element.querySelector('img[align=right]');
      if (logo) {
        logo.remove();
        const contentBox = element.querySelector('content-box');
        contentBox.insertBefore(logo, contentBox.firstChild);
      }
      return { element, title: '' };
    }
    if (contentId === 'outline') {
      const element = html`<pptr-api>${this.api.createOutline()}</pptr-api>`;
      return { element, title: '', selectedSidebarElement: this._outlineItem };
    }
    const entry = this.api.idToEntry(contentId);
    if (!entry)
      return null;
    if (entry instanceof APIClass) {
      const element = this._showAPIClass(entry);
      const title = entry.name;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title, selectedSidebarElement};
    }
    if (entry instanceof APISection) {
      const element = html`
        <pptr-api>
          <content-box>${entry.element}</content-box>
        </pptr-api>
      `;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title: '', selectedSidebarElement};
    }
    const element = this._showAPIClass(entry.apiClass);
    const scrollAnchor = this._scrollAnchor(entry.element);
    const title = entry.apiClass.loweredName + '.' + entry.name;
    const selectedSidebarElement = this._entryToSidebarElement.get(entry.apiClass);
    return {element, title, selectedSidebarElement, scrollAnchor};
  }

  _initializeSidebarElements() {
    this._outlineItem = html`<a class=pptr-sidebar-item href=${app.linkURL(PRODUCT_NAME, this.api.version, 'outline')}>Outline</a>`;
    this._sidebarElements = [
      html`<pptr-sidebar-divider>API</pptr-sidebar-divider>`,
      this._outlineItem,
      ...this.api.sections.map(section => {
        const item = html`<a class=pptr-sidebar-item href=${section.linkURL()}>${section.name}</a>`;
        this._entryToSidebarElement.set(section, item);
        return item;
      }),
      ...this.api.classes.map(apiClass => {
        const item = html`<a class=pptr-sidebar-item href=${apiClass.linkURL()}><pptr-class-icon></pptr-class-icon>${apiClass.name}</a>`;
        this._entryToSidebarElement.set(apiClass, item);
        return item;
      }),
    ];
  }

  _showAPIClass(apiClass) {
    function render(title, entries) {
      if (!entries.length)
        return '';
      return html`
        <h3>${title}</h3>
        <content-box>${entries.map(entry => html`
          ${entry.element}
          <content-delimeter></content-delimeter>
        `)}
        </content-box>
      `;
    }
    return html`
      <pptr-api>
        <content-box>${apiClass.element}</content-box>
        ${render('NameSpaces', apiClass.namespaces)}
        ${render('Events', apiClass.events)}
        ${render('Methods', apiClass.methods)}
        <pptr-api-padding>
          <img width=30 src="./images/pptr.png"></img>
        </pptr-api-padding>
      </pptr-api>
    `;
  }

  _scrollAnchor(entryElement) {
    if (entryElement.previousSibling && entryElement.previousSibling.tagName === 'CONTENT-DELIMETER')
      return entryElement.previousSibling;
    let parentBox = entryElement;
    while (parentBox && parentBox.tagName !== 'CONTENT-BOX')
      parentBox = parentBox.parentElement;
    return parentBox;
  }
}

class PPTRSearchItem extends SearchComponent.Item {
  static createForMethod(apiMethod) {
    const className = apiMethod.apiClass.loweredName;
    const name = apiMethod.name;
    const args = apiMethod.args;

    const desc = apiMethod.element.querySelector('p');
    const text = `${className}.${name}(${args})`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.', tagName: 'search-item-api-method-class'},
      {text: `${name}(${args})`, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(apiMethod, text, 'pptr-method-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForEvent(apiEvent) {
    const className = apiEvent.apiClass.loweredName;
    const name = apiEvent.name;

    const desc = apiEvent.element.querySelector('p');
    const text = `${className}.on('${name}')`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.on(', tagName: 'search-item-api-method-class'},
      {text: `'${name}'`, tagName: 'search-item-api-method-name'},
      {text: ')', tagName: 'search-item-api-method-class'},
    ]);
    return new PPTRSearchItem(apiEvent, text, 'pptr-event-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForNamespace(apiNamespace) {
    const className = apiNamespace.apiClass.loweredName;
    const name = apiNamespace.name;

    const desc = apiNamespace.element.querySelector('p');
    const text = `${className}.${name}`;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className + '.', tagName: 'search-item-api-method-class'},
      {text: name, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(apiNamespace, text, 'pptr-ns-icon', titleRenderer, desc ? desc.textContent : '');
  }

  static createForClass(apiClass) {
    const className = apiClass.name;

    const desc = apiClass.element.querySelector('p');
    const text = className;
    const titleRenderer = matches => renderTokensWithMatches(matches, [
      {text: className, tagName: 'search-item-api-method-name'},
    ]);
    return new PPTRSearchItem(apiClass, text, 'pptr-class-icon', titleRenderer, desc ? desc.textContent : '');
  }

  constructor(apiEntry, text, iconTagName, titleRenderer, description) {
    super();
    this._url = apiEntry.linkURL(PRODUCT_NAME);
    this._text = text;
    this._iconTagName = iconTagName;
    this._titleRenderer = titleRenderer;
    this._description = description;

    this._subtitleElement = null;
    this._iconElement = null;
  }

  url() {
    return this._url;
  }

  text() {
    return this._text;
  }

  titleElement(matches) {
    return this._titleRenderer.call(null, matches);
  }

  iconElement() {
    if (!this._iconElement && this._iconTagName)
      this._iconElement = document.createElement(this._iconTagName);
    return this._iconElement;
  }

  subtitleElement() {
    if (!this._description)
      return null;
    if (!this._subtitleElement)
      this._subtitleElement = document.createTextNode(this._description);
    return this._subtitleElement;
  }
}

/**
 * @param {string} text
 * @param {!Array<number>} matches
 * @param {number} fromIndex
 * @param {number} fromIndex
 * @return {!Element}
 */
function renderTokensWithMatches(matches, tokens) {
  if (!matches.length) {
    const fragment = document.createDocumentFragment();
    for (let token of tokens) {
      if (token.tagName) {
        const node = document.createElement(token.tagName);
        node.textContent = token.text;
        fragment.appendChild(node);
      } else {
        fragment.appendChild(document.createTextNode(token.text));
      }
    }
    return fragment;
  }

  const fragment = document.createDocumentFragment();
  let offset = 0;
  let matchesSet = new Set(matches);
  for (let token of tokens) {
    const result = token.tagName ? document.createElement(token.tagName) : document.createDocumentFragment();
    let from = 0;
    let lastInsideHighlight = false;
    for (let to = 0; to <= token.text.length; ++to) {
      const insideHighlight = matchesSet.has(to + offset);
      if (insideHighlight === lastInsideHighlight && to < token.text.length)
        continue;
      if (from < to) {
        if (lastInsideHighlight) {
          const node = document.createElement('search-highlight');
          node.textContent = token.text.substring(from, to);
          result.appendChild(node);
        } else {
          const node = document.createTextNode(token.text.substring(from, to));
          result.appendChild(node);
        }
        from = to;
      }
      lastInsideHighlight = insideHighlight;
    }
    offset += token.text.length;
    fragment.appendChild(result);
  }
  return fragment;
}

