window.addEventListener('DOMContentLoaded', async () => {
  // get all releases:
  //
  //   const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))
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

  const api = APIDocumentation.create(apiText);
  sidebar.setAPIDocumentation(api);

  content.showMarkDown(unpad(`
    # Welcome to PPTR hub!
  `, 4));
});

function unpad(text, spaces) {
  const indent = ' '.repeat(spaces);
  return text.split('\n').map(line => line.startsWith(indent) ? line.substring(spaces) : line).join('\n');
}
