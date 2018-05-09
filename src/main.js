window.addEventListener('DOMContentLoaded', async () => {
  // get all releases:
  //
  //   const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))

  window.app = new App(document.body);

  const provider = await PPTRProvider.create();
  app.setProvider(provider);
});

class App {
  constructor(container) {
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
        const {element, scrollAnchor} = this._provider.getContent(params.get('show'));
        this._content.show(element, scrollAnchor);
      }
      if (params.has('q')) {
        const query = params.get('q');
        search.setVisible(true);
        toolbar.setInputText(query);
        search.search(query);
      }
    });
  }

  setProvider(provider) {
    this._provider = provider;
    this._sidebar.setAPIDocumentation(provider.api);
    this._search.setItems(provider.searchItems());
  }

  show(contentId) {
  }

  createRoute({contentId, productName}) {
  }
}

class Provider {
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
