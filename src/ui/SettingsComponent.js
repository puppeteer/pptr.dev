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
import {EventEmitter} from './EventEmitter.js';
import {html} from './html.js';

export class SettingsComponent extends EventEmitter {
  constructor() {
    super();
    this.element = html`<settings-component/>`;

    this._selectedItem = null;
    document.body.addEventListener('keydown', event => {
      if (!this.element.parentElement)
        return;
      if (event.key === 'Escape') {
        this.hide();
        event.preventDefault();
        event.stopPropagation();
      }
    }, false);
    this.element.addEventListener('click', () => this.hide(), false);
  }

  _selectItem(item) {
    if (this._selectedItem)
      this._selectedItem.classList.remove('selected');
    this._selectedItem = item;
    if (this._selectedItem)
      this._selectedItem.classList.add('selected');
  }

  show(product, version) {
    const renderVersion = (description) => {
      const selected = description.name === version.name();
      const item = html`
        <product-version class=${selected ? 'selected' : ''}>
          <version-name>${description.name}</version-name>
          <version-description>${description.description}</version-description>
          <version-date>${formatDate(description.date)}</version-date>
        </product-version>
      `;
      item[SettingsComponent._Symbol] = {product, versionName: description.name};
      return item;
    };

    this.element.innerHTML = '';
    this.element.appendChild(html`
      <settings-content>
        <settings-header>
          <h3>Settings</h3>
          <img class=settings-close-icon src='./images/close.svg'></img>
        </settings-header>
        <product-versions>${product.versionDescriptions().map(renderVersion)}
        </product-versions>
        ${product.settingsFooterElement()}
        <website-version>
          <div>WebSite Version:<code>${window.__WEBSITE_VERSION__ || 'tip-of-tree'}</code> <a target=_blank href="https://github.com/GoogleChromeLabs/pptr.dev/issues">File a bug!</a></div>
        </website-version>
      </settings-content>
    `);
    this.element.$('settings-content').addEventListener('click', event => {
      event.stopPropagation();
      // Support clicks on links, e.g. "file a bug".
      if (event.target.tagName === 'A') {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      // Allow selecting versions.
      if (!window.getSelection().isCollapsed)
        return;
      if (event.target.classList.contains('settings-close-icon')) {
        this.hide();
        return;
      }
      let item = event.target;
      while (item && item.tagName !== 'PRODUCT-VERSION')
        item = item.parentElement;
      if (!item)
        return;
      this._selectItem(item);
      const {product, versionName} = item[SettingsComponent._Symbol];
      this.hide();
      this.emit(SettingsComponent.Events.VersionSelected, product, versionName);
    }, false);

    document.body.appendChild(this.element);
    this._selectedItem = this.element.$('product-version.selected');
    if (this._selectedItem)
      this._selectedItem.scrollIntoViewIfNeeded();

    function formatDate(date) {
      if (!date)
        return 'N/A';
      const monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      return monthNames[month] + ' ' + day + ', ' + year;
    }
  }

  hide() {
    this.element.remove();
    // Cleanup content to free some memory.
    this.element.innerHTML = '';
    this._selectedItem = null;
  }
}

SettingsComponent._Symbol = Symbol('SettingsComponent._Symbol');

SettingsComponent.Events = {
  VersionSelected: 'VersionSelected',
};
