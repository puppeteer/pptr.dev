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

    this._provider = null;
    this._providerName = null;
    this._contentId = null;
    this._isNavigating = false;
    this._pendingNavigation = null;

    window.addEventListener('popstate', this._requestNavigation.bind(this), false);
  }

  _requestNavigation() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const providerName = params.get('p');
    const contentId = params.get('show');
    this._pendingNavigation = {providerName, contentId};
    Promise.resolve().then(() => this._doNavigation());
  }

  async _doNavigation() {
    if (this._isNavigating)
      return;
    this._isNavigating = true;
    // Since navigation is async, more pending navigations might
    // be scheduled.
    while (this._pendingNavigation) {
      const navigationRequest = this._pendingNavigation;
      delete this._pendingNavigation;
      if (navigationRequest.providerName !== this._providerName) {
        const factory = this._providerFactories.get(navigationRequest.providerName);
        if (!factory) {
          this._provider = null;
          this._providerName = null;
          this._contentId = null;
          continue;
        }
        this._providerName = navigationRequest.providerName;
        this._provider = await factory.call(null, navigationRequest.providerName);
      }
      this._contentId = navigationRequest.contentId;
    }
    // All requested navigations are finished; update UI.
    if (this._provider) {
      this._sidebar.setAPIDocumentation(this._provider.api);
      this._search.setItems(this._provider.searchItems());
      const {element, scrollAnchor} = this._provider.getContent(this._contentId);
      this._content.show(element, scrollAnchor);
    } else {
      this._providerName = null;
      this._contentId = null;
      this._sidebar.setAPIDocumentation(null);
      this._search.setItems([]);
      this._show404();
      // TODO: show 404.
    }
    this._isNavigating = false;
  }

  initialize(factories) {
    for (const [name, factory] of Object.entries(factories))
      this._providerFactories.set(name, factory);
    if (window.location.hash.length > 1)
      this._requestNavigation();
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

  _show404() {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Not Found: 404!</h1>
    `;
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
