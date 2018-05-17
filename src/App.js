class App {
  constructor(container) {
    this._content = new ContentComponent();
    this._sidebar = new SidebarComponent();
    this._toolbar = new ToolbarComponent();
    this._search = new SearchComponent();
    this._settings = new SettingsComponent();
    this._settings.on(SettingsComponent.Events.VersionSelected, (product, versionName) => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const contentId = params.get('show') || undefined;
      this.navigate(versionName, contentId);
    });

    this._settingsButton = document.createElement('settings-button');
    this._settingsButton.innerHTML = '<img src="./images/cog.svg"></img>';
    this._settingsButton.addEventListener('click', () => {
      this._sidebar.hideOnMobile();
      this._settings.show(this._product, this._version);
    }, false);

    this._menuButton = document.createElement('menu-button');
    this._menuButton.innerHTML = '<img src="./images/menu.svg"></img>';
    this._menuButton.addEventListener('click', () => {
      this._sidebar.toggleOnMobile();
    }, false);

    this._searchButton = document.createElement('search-button');
    this._searchButton.innerHTML = '<img src="./images/search.svg"></img>';
    this._searchButton.addEventListener('click', event => {
      this._search.toggleSearch();
      this._sidebar.hideOnMobile();
      event.stopPropagation();
      event.preventDefault();
    }, false);

    this._homeButton = document.createElement('home-button');
    this._homeButton.innerHTML = '<img src="./images/home.svg"></img>';
    this._homeButton.addEventListener('click', () => {
      this._sidebar.hideOnMobile();
      this.navigateURL('');
    }, false);

    this._titleElement = document.createElement('app-title');
    this._titleVersionName = document.createElement('app-title-version-name');
    this._titleVersionName.addEventListener('click', () => {
      this._sidebar.hideOnMobile();
      this._settings.show(this._product, this._version);
    }, false);

    container.appendChild(this._content.element);
    container.appendChild(this._sidebar.glasspane);
    container.appendChild(this._sidebar.element);
    container.appendChild(this._toolbar.element);

    this._product = null;
    this._version = null;

    window.addEventListener('popstate', this._doNavigation.bind(this), false);
  }

  _doNavigation() {
    if (!this._product)
      return;
    this._sidebar.hideOnMobile();
    const params = new URLSearchParams(window.location.hash.substring(1));
    const versionName = params.get('version') || this._product.defaultVersionName();

    let newVersion = this._version;
    if (!this._version || this._version.name() !== versionName)
      newVersion = this._product.getVersion(versionName);
    let content = newVersion ? newVersion.content(params.get('show')) : null;

    if (!content) {
      history.replaceState({}, '', this.linkURL(this._product.name(), newVersion.name()));
      content = newVersion.content(null);
    }

    this._version = newVersion;
    this._sidebar.setElements(this._version.sidebarElements());
    this._search.setItems(this._version.searchItems());
    this._titleElement.textContent = '';
    this._titleElement.appendChild(document.createTextNode(this._product.name() + ' '));
    this._titleVersionName.textContent = this._version.name();
    this._titleElement.appendChild(this._titleVersionName);
    this._titleElement.appendChild(document.createTextNode(' Search: '));
    this._sidebar.setSelected(content.selectedSidebarElement);
    this._search.setInputValue(content.title);
    this._content.show(content.element, content.scrollAnchor);
    this._content.element.focus();
    if (content.title)
      document.title = content.title;
    else
      document.title = this._product.name() + ' ' + this._version.name();
  }

  initialize(product) {
    this._product = product;
    this._toolbar.left().appendChild(this._menuButton);
    this._toolbar.left().appendChild(this._homeButton);
    this._toolbar.left().appendChild(this._titleElement);
    this._toolbar.left().appendChild(this._search.input);

    this._toolbar.middle().appendChild(this._searchButton);
    this._toolbar.middle().appendChild(this._settingsButton);

    for (const e of product.toolbarElements())
      this._toolbar.right().appendChild(e);
    this._doNavigation();
  }

  navigate(versionName, contentId) {
    window.location.hash = this.linkURL(this._product.name(), versionName, contentId);
  }

  navigateHome() {
    if (this._version)
      this.navigate(this._version.name());
    else
      this.navigate(this._product.defaultVersionName());
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
}

App.Product = class {
  name() {
  }

  toolbarElements() {
    return [];
  }

  defaultVersionName() {
  }

  /**
   * @return {!Array<!{name: string, description: string, date: Date}>}
   */
  versionDescriptions() {
    return [];
  }

  settingsFooterElement() {
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
