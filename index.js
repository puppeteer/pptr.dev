import {} from './src/polyfills.js';
import {App} from './src/App.js';
import {PPTRProduct} from './pptr/PPTRProduct.js';

window.addEventListener('DOMContentLoaded', async () => {
  window.app = new App(document.body);
  const product = await PPTRProduct.create();
  app.initialize(product);
});

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('./sw.js');
});
