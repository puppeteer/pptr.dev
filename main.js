window.addEventListener('DOMContentLoaded', async () => {
  // get all releases:
  //
  //   const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text()))
  //

  const apiText = await fetch('./api.md').then(response => response.text());

  console.time('commonmark');
  const reader = new commonmark.Parser();
  const ast = reader.parse(apiText);
  var writer = new commonmark.HtmlRenderer();
  var result = writer.render(ast);
  console.timeEnd('commonmark');
  document.body.innerHTML = result;
});
