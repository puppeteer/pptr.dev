class App {
  constructor(container) {
    this._providerFactories = new Map();

    this._content = new ContentComponent();
    this._sidebar = new SidebarComponent();
    this._toolbar = new ToolbarComponent();
    this._search = new SearchComponent();

    container.appendChild(this._content.element);
    container.appendChild(this._sidebar.element);
    container.appendChild(this._toolbar.element);

    new Router(params => {
      if (!this._provider)
        return;
      if (params.has('show')) {
        this.show(params.get('show'));
      }
      if (params.has('q')) {
        const query = params.get('q');
        search.setVisible(true);
        toolbar.setInputText(query);
        search.search(query);
      }
    });
  }

  addProviderFactory(providerName, factory) {
    this._providerFactories.set(providerName, factory);
  }

  providerFactories() {
    return Array.from(this._providerFactories.keys());
  }

  async selectProvider(providerName) {
    const factory = this._providerFactories.get(providerName);
    if (!factory)
      return false;
    this._provider = await factory.call(null, providerName);
    this._sidebar.setAPIDocumentation(this._provider.api);
    this._search.setItems(this._provider.searchItems());
  }

  show(contentId) {
    const {element, scrollAnchor} = this._provider.getContent(contentId);
    this._content.show(element, scrollAnchor);
  }

  showElement(element) {
    this._content.show(element);
  }

  createRoute({contentId, productName}) {
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
