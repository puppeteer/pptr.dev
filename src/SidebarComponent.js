class SidebarComponent {
  constructor() {
    this.element = document.createElement('sidebar-component');
    this.element.addEventListener('click', this._onClick.bind(this), false);

    this._resourcesDivider = document.createElement('sidebar-divider');
    this._resourcesDivider.textContent = 'Resources';

    this._apiDivider = document.createElement('sidebar-divider');
    this._apiDivider.innerHTML = `API <span>Tip-of-Tree</span>`;

    this._selectedItem = null;
    this._apiDoc = null;
  }

  _onClick(event) {
    const item = event.path.find(node => node.classList && node.classList.contains('sidebar-item'));
    if (item && this._selectedItem !== item) {
      if (this._selectedItem)
        this._selectedItem.classList.remove('selected');
      this._selectedItem = item;
      this._selectedItem.classList.add('selected');
    }
  }

  setAPIDocumentation(apiDoc) {
    this._apiDoc = apiDoc;
    this._render();
  }

  _render() {
    this.element.innerHTML = '';
    this.element.appendChild(this._resourcesDivider);
    this.element.appendChild(createItem('Slack', 'https://join.slack.com/t/puppeteer/shared_invite/enQtMzU4MjIyMDA5NTM4LTM1OTdkNDhlM2Y4ZGUzZDdjYjM5ZWZlZGFiZjc4MTkyYTVlYzIzYjU5NDIyNzgyMmFiNDFjN2UzNWU0N2ZhZDc'));
    this.element.appendChild(createItem('StackOverflow', 'https://stackoverflow.com/questions/tagged/puppeteer'));
    this.element.appendChild(createItem('Github', 'https://github.com/GoogleChrome/puppeteer/issues'));
    this.element.appendChild(createItem('ToubleShooting', 'https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md'));
    if (!this._apiDoc)
      return;
    this._apiDivider.innerHTML = `API <span>${this._apiDoc.version}</span>`;
    this.element.appendChild(this._apiDivider);
    this.element.appendChild(createItem('Overview', Router.createRoute(this._apiDoc.version, 'overview')));
    for (const apiClass of this._apiDoc.classes) {
      const route = Router.createRoute(this._apiDoc.version, this._apiDoc.viewToId.get(apiClass));
      const item = createItem(apiClass.name, route);
      this.element.appendChild(item);
    }

    function createItem(text, route) {
      const item = document.createElement('a');
      item.classList.add('sidebar-item');
      item.href = route;
      if (item.hostname !== location.hostname)
        item.innerHTML = `${text}<external-link-icon></external-link-icon>`;
      else
        item.textContent = text;
      return item;
    }
  }
}

