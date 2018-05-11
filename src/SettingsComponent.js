class SettingsComponent extends EventEmitter {
  constructor() {
    super();
    this.element = document.createElement('settings-component');
    this._contentElement = document.createElement('settings-content');
    this.element.appendChild(this._contentElement);

    this._selectedItem = null;
    document.body.addEventListener('keydown', event => {
      if (!this.element.parentElement)
        return;
      if (event.key === 'Escape') {
        this.hide();
        event.preventDefault();
        event.stopPropagation();
      }
    }, false);
    this._contentElement.addEventListener('click', event => {
      let item = event.target;
      while (item && item.tagName !== 'PRODUCT-VERSION')
        item = item.parentElement;
      if (!item)
        return;
      this._selectItem(item);
      const {product, versionName} = item[SettingsComponent._Symbol];
      this.emit(SettingsComponent.Events.VersionSelected, product, versionName);
      event.stopPropagation();
      event.preventDefault();
    }, false);
    this.element.addEventListener('click', () => this.hide(), false);
  }

  _selectItem(item) {
    if (this._selectedItem)
      this._selectedItem.classList.remove('selected');
    this._selectedItem = item;
    if (this._selectedItem)
      this._selectedItem.classList.add('selected');
  }

  show(product, version) {
    this._contentElement.innerHTML = '';
    if (product) {
      const versionsContainer = document.createElement('product-versions');
      for (const versionName of product.versionNames()) {
        const item = document.createElement('product-version');
        const icon = document.createElement('img');
        icon.src = '/images/checkmark.svg';
        item.appendChild(icon);
        const name = document.createElement('version-name');
        name.textContent = versionName;
        item.appendChild(name);
        item[SettingsComponent._Symbol] = {product, versionName};
        versionsContainer.appendChild(item);
        if (versionName === version.name())
          this._selectItem(item);
      }
      this._contentElement.appendChild(versionsContainer);
    }
    document.body.appendChild(this.element);
  }

  hide() {
    this.element.remove();
    // Cleanup content to free some memory.
    this._contentElement.innerHTML = '';
    this._selectedItem = null;
  }
}

SettingsComponent._Symbol = Symbol('SettingsComponent._Symbol');

SettingsComponent.Events = {
  VersionSelected: 'VersionSelected',
};
