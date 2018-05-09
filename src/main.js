window.addEventListener('DOMContentLoaded', async () => {
  // get all releases:
  //
  //   const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))
  //
  //

  const content = new ContentComponent();
  const sidebar = new SidebarComponent();
  const toolbar = new ToolbarComponent();
  document.body.appendChild(content.element);
  document.body.appendChild(sidebar.element);
  document.body.appendChild(toolbar.element);

  const search = new SearchComponent();

  const apiText = await fetch('./api.md').then(response => response.text());

  const api = APIDocumentation.create('tip-of-tree', apiText);
  sidebar.setAPIDocumentation(api);
  search.setItems(api.searchItems);

  window.api = api;

  const defaultRoute = Router.createRoute(api.version, api.entryToId(api.sections[0]));
  new Router(defaultRoute, params => {
    if (params.has('show')) {
      const entry = api.idToEntry(params.get('show'));
      if (entry) {
        if (entry instanceof APIClass)
          content.showAPIClass(entry);
        else if (entry instanceof APIMethod)
          content.showAPIMethod(entry);
        else if (entry instanceof APIEvent)
          content.showAPIEvent(entry);
        else if (entry instanceof APINamespace)
          content.showAPINamespace(entry);
        else if (entry instanceof APISection)
          content.showAPISection(entry);
      }
    }
    if (params.has('q')) {
      const query = params.get('q');
      search.setVisible(true);
      toolbar.setInputText(query);
      search.search(query);
    }
  });
});
