window.addEventListener('DOMContentLoaded', async () => {
  window.app = new App(document.body);
  app.addProviderFactory('pptr-dev', name => PPTRProvider.create(name));

  //const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))

  app.navigate('pptr-dev', 'api-overview');
});

