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

  sidebar.on(SidebarComponent.Events.ClassSelected, apiClass => {
    content.showAPIClass(apiClass);
  });
  sidebar.on(SidebarComponent.Events.OverviewSelected, apiDoc => {
    content.showElements(apiDoc.overview.map(section => section.element));
  });

  const apiText = await fetch('./api.md').then(response => response.text());

  const api = APIDocumentation.create('tip-of-tree', apiText);
  sidebar.setAPIDocumentation(api);

  content.showElements(api.overview.map(section => section.element));

  const router = new Router(params => {
    if (params.has('show')) {
      const viewId = params.get('show');
      const view = api.idToView.get(viewId);
      if (view instanceof APIClass)
        content.showAPIClass(view);
      else if (view instanceof APIMethod)
        content.showAPIMethod(view);
      else if (view instanceof APIEvent)
        content.showAPIEvent(view);
      else if (view instanceof APINamespace)
        content.showAPINamespace(view);
    }
  });
});

function unpad(text, spaces) {
  const indent = ' '.repeat(spaces);
  return text.split('\n').map(line => line.startsWith(indent) ? line.substring(spaces) : line).join('\n');
}
