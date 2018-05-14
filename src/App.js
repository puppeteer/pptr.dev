class App {
  constructor(container) {
    this._content = new ContentComponent();
    this._sidebar = new SidebarComponent();
    this._toolbar = new ToolbarComponent();
    this._search = new SearchComponent();
    this._settings = new SettingsComponent();
    this._settings.on(SettingsComponent.Events.VersionSelected, (product, versionName) => {
      this.setProduct(product);
      this.navigate(versionName);
    });

    this._settingsButton = document.createElement('settings-button');
    this._settingsButton.innerHTML = '<img src="./images/cog.svg"></img>';
    this._settingsButton.addEventListener('click', () => {
      this._settings.show(this._product, this._version);
    }, false);

    this._homeButton = document.createElement('home-button');
    this._homeButton.innerHTML = '<img src="./images/home.svg"></img>';
    this._homeButton.addEventListener('click', () => {
      this.navigate(this._version.name());
    }, false);

    this._titleElement = document.createElement('app-title');

    this._toolbar.left().appendChild(this._homeButton);
    this._toolbar.left().appendChild(this._settingsButton);
    this._toolbar.left().appendChild(this._titleElement);
    this._toolbar.middle().appendChild(this._search.input);

    container.appendChild(this._content.element);
    container.appendChild(this._sidebar.element);
    container.appendChild(this._toolbar.element);

    this._product = null;
    this._version = null;

    window.addEventListener('popstate', this._doNavigation.bind(this), false);
  }

  _doNavigation() {
    if (!this._product)
      return;
    const params = new URLSearchParams(window.location.hash.substring(1));
    const versionName = params.get('version');

    let newVersion = this._version;
    if (!this._version || this._version.name() !== versionName)
      newVersion = this._product.getVersion(versionName);
    let content = newVersion ? newVersion.content(params.get('show')) : null;
    if (!newVersion) {
      this.navigate(this._product.defaultVersionName());
      return;
    }

    if (!content) {
      this.navigate(newVersion.name());
      return;
    }

    this._version = newVersion;
    this._sidebar.setElements(this._version.sidebarElements());
    this._search.setItems(this._version.searchItems());
    this._titleElement.textContent = this._product.name() + ' ' + this._version.name();
    this._sidebar.setSelected(content.selectedSidebarElement);
    this._search.setInputValue(content.title);
    this._content.show(content.element, content.scrollAnchor);
    this._content.element.focus();
    if (content.title)
      document.title = content.title;
    else
      document.title = this._product.name() + ' ' + this._version.name();
  }

  setProduct(product) {
    if (this._product === product)
      return;
    this._product = product;
    this._doNavigation();
  }

  navigate(versionName, contentId) {
    window.location.hash = this.linkURL(this._product.name(), versionName, contentId);
  }

  navigateURL(url) {
    window.location = url;
  }

  linkURL(productName, versionName, contentId) {
    let result = `#?product=${productName}&version=${versionName}`;
    if (contentId)
      result += `&show=${contentId}`;
    return result;
  }

  focusContent() {
    this._content.element.focus();
  }

  _show404() {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Not Found: 404!</h1>
    `;
    this._content.show(element);
  }
}

App.Product = class {
  name() {
  }

  defaultVersionName() {
  }

  versionNames() {
  }

  getVersion(name) {
  }
}

App.ProductVersion = class {
  name() {
  }

  searchItems() {
    return [];
  }

  sidebarElements() {
    return [];
  }

  /**
   * @param {string} contentId
   * @return {?{title: string, element: !Node, scrollAnchor: ?Node, selectedSidebarElement: ?Element}}
   */
  content(contentId) {
    return null;
  }
}
