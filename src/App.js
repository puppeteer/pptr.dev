class App {
  constructor(container) {
    this._providerFactories = new Map();

    this._content = new ContentComponent();
    this._sidebar = new SidebarComponent();
    this._toolbar = new ToolbarComponent();
    this._search = new SearchComponent();

    this._toolbar.middle().appendChild(this._search.input);

    container.appendChild(this._content.element);
    container.appendChild(this._sidebar.element);
    container.appendChild(this._toolbar.element);

    window.addEventListener('popstate', this._navigateApp.bind(this), false);
    if (window.location.hash.length > 1)
      this._navigateApp();
  }

  async _navigateApp() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const providerName = params.get('p');
    const factory = this._providerFactories.get(providerName);
    if (!factory) {
      //TODO: show 404
      return;
    }
    if (providerName !== this._providerName) {
      this._providerName = providerName;
      this._provider = await factory.call(null, providerName);
      this._sidebar.setAPIDocumentation(this._provider.api);
      this._search.setItems(this._provider.searchItems());
    }
    const contentId = params.get('show');
    const {element, scrollAnchor} = this._provider.getContent(contentId);
    this._content.show(element, scrollAnchor);
  }

  addProviderFactory(providerName, factory) {
    this._providerFactories.set(providerName, factory);
  }

  providerFactories() {
    return Array.from(this._providerFactories.keys());
  }

  navigate(providerName, contentId) {
    window.location.hash = this.linkURL(providerName, contentId);
  }

  linkURL(providerName, contentId) {
    return `#?p=${providerName}&show=${contentId}`;
  }

  showElement(element) {
    this._content.show(element);
  }
}

class AppProvider {
  constructor() {
    this.searchItems;
    this.getContent = (contentId) => {};
  }

  searchItems() {
    return [];
  }

  sidebarElements() {
    return [];
  }

  getContent(id) {
    return null;
  }
}
