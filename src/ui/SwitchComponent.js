/**
 * Copyright 2019 Google Inc. All rights reserved.
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
import { html } from "./html.js";

const darkClass = "is-dark";
const isDark = "isDark";
export class SwitchComponent {
  constructor() {
    this.element = html`
      <switch-component>
        <p>Dark mode</p>
        <input type="checkbox" id="switch" class="checkbox-switch" hidden />
        <label for="switch" class="label-switch"></label>
      </switch-component>
    `;
    this.element.addEventListener("click", this._onClick.bind(this), false);
    this.element.addEventListener("DOMContentLoaded", this._addDarkModeClass());
  }

  checkboxDarkModeActive() {
    if (this._isDarkModeAlreadyActive()) {
      document.getElementById("switch").checked = true;
    }
  }

  _addDarkModeClass() {
    if (this._isDarkModeAlreadyActive()) {
      document.body.classList.add(darkClass);
    }
  }

  _onClick(event) {
    if (document.body.classList.contains(darkClass)) {
      this._toggleDarkMode(false);
    } else {
      this._toggleDarkMode(true);
    }
    event.stopPropagation();
    event.preventDefault();
  }

  _toggleDarkMode(bool) {
    document.getElementById("switch").checked = bool;
    document.body.classList.toggle(darkClass);
    localStorage.setItem(isDark, bool);
  }

  _isDarkModeAlreadyActive() {
    return JSON.parse(localStorage.getItem(isDark)) === true;
  }
}
