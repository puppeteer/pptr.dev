class SidebarComponent {
  constructor() {
    this.element = document.createElement('sidebar-component');
    this.element.addEventListener('click', this._onClick.bind(this), false);

    this._selectedItem = null;
  }

  _onClick(event) {
    const item = event.path.find(node => node.parentElement === this.element);
    if (item && this._selectedItem !== item) {
      if (this._selectedItem)
        this._selectedItem.classList.remove('selected');
      this._selectedItem = item;
      this._selectedItem.classList.add('selected');
    }
  }

  setElements(elements) {
    this.element.innerHTML = '';
    for (const element of elements) {
      const item = document.createElement('sidebar-item');
      item.appendChild(element);
      this.element.appendChild(item);
    }
  }

  setSelected(element) {
    if (this._selectedItem) {
      this._selectedItem.classList.remove('selected');
      this._selectedItem = null;
    }
    if (!element)
      return;
    const item = element.parentElement;
    if (!item || item.parentElement !== this.element)
      return;
    this._selectedItem = item;
    this._selectedItem.classList.add('selected');
  }
}

