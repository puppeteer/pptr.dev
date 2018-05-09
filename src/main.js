window.addEventListener('DOMContentLoaded', async () => {
  window.app = new App(document.body);

  //const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))

  app.addProviderFactory('pptr-dev', name => PPTRProvider.create(name));
  app.selectProvider('pptr-dev');
});

