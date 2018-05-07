class SidebarComponent extends EventEmitter {
  constructor() {
    super();
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
    const item = event.path.find(node => node.tagName && node.tagName.toLowerCase() === 'sidebar-item');
    if (item && this._selectedItem !== item) {
      if (this._selectedItem)
        this._selectedItem.classList.remove('selected');
      this._selectedItem = item;
      this._selectedItem.classList.add('selected');
      if (item === this._overviewItem)
        this.emit(SidebarComponent.Events.OverviewSelected, this._apiDoc);
      else
        this.emit(SidebarComponent.Events.ClassSelected, item[SidebarComponent._classSymbol]);
    }
  }

  setAPIDocumentation(apiDoc) {
    this._apiDoc = apiDoc;
    this._render();
  }

  _render() {
    this.element.innerHTML = '';
    this.element.appendChild(this._resourcesDivider);
    this.element.appendChild(createItem('Slack'));
    this.element.appendChild(createItem('StackOverflow'));
    this.element.appendChild(createItem('Github'));
    this.element.appendChild(createItem('ToubleShooting'));
    if (!this._apiDoc)
      return;
    this._apiDivider.innerHTML = `API <span>${this._apiDoc.version}</span>`;
    this.element.appendChild(this._apiDivider);
    this._overviewItem = createItem('Overview');
    this.element.appendChild(this._overviewItem);
    for (const apiClass of this._apiDoc.classes) {
      const item = createItem(apiClass.name);
      item[SidebarComponent._classSymbol] = apiClass;
      this.element.appendChild(item);
    }

    function createItem(text) {
      const item = document.createElement('sidebar-item');
      item.textContent = text;
      return item;
    }
  }
}

SidebarComponent._classSymbol = Symbol('SidebarComponent._classSymbol');

SidebarComponent.Events = {
  OverviewSelected: 'OverviewSelected',
  ClassSelected: 'ClassSelected',
};
