window.addEventListener('DOMContentLoaded', async () => {
  // get all releases:
  //
  //   const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))
  //

  const apiText = await fetch('./api.md').then(response => response.text());

  const api = APIDocumentation.create(apiText);

  document.body.appendChild(api.overview.element);
  document.body.appendChild(api.env.element);

  for (const apiClass of api.classes) {
    document.body.appendChild(apiClass.element);
    for (const event of apiClass.events)
      document.body.appendChild(event.element);
    for (const method of apiClass.methods)
      document.body.appendChild(method.element);
    for (const ns of apiClass.namespaces)
      document.body.appendChild(ns.element);
  }
});
