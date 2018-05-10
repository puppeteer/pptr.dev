class App {
  constructor(container) {
    this._content = new ContentComponent();
    this._sidebar = new SidebarComponent();
    this._toolbar = new ToolbarComponent();
    this._search = new SearchComponent();

    this._toolbar.middle().appendChild(this._search.input);

    container.appendChild(this._content.element);
    container.appendChild(this._sidebar.element);
    container.appendChild(this._toolbar.element);

    this._product = null;
    this._version = null;

    window.addEventListener('popstate', this._doNavigation.bind(this), false);
  }

  _doNavigation() {
    if (!this._product)
      return;
    const params = new URLSearchParams(window.location.hash.substring(1));
    const versionName = params.get('product');
    let contentId = params.get('show');

    if (!this._version || this._version.name() !== versionName) {
      const version = this._product.getVersion(versionName);
      if (!version) {
        this.navigate(this._product.defaultVersionName(), contentId);
        return;
      }
      this._version = version;
      this._sidebar.setElements(this._version.sidebarElements());
      this._search.setItems(this._version.searchItems());
    }
    contentId = contentId || this._version.defaultContentId();
    const {element, scrollAnchor} = this._version.getContent(contentId);
    this._content.show(element, scrollAnchor);
    this._sidebar.setSelected(this._version.getSelectedSidebarElement(contentId));
    this._search.input.value = this._version.getTitle(contentId);
    this._content.element.focus();
  }

  setProduct(product) {
    this._product = product;
    this._doNavigation();
  }

  navigate(versionName, contentId) {
    window.location.hash = this.linkURL(versionName, contentId);
  }

  navigateURL(url) {
    window.location = url;
  }

  linkURL(versionName, contentId) {
    let result = `#?product=${versionName}`;
    if (contentId)
      result += `&show=${contentId}`;
    return result;
  }

  focusContent() {
    this._content.element.focus();
  }

  _show404() {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Not Found: 404!</h1>
    `;
    this._content.show(element);
  }
}

class Product {
  defaultVersionName() {
  }

  versionNames() {
  }

  getVersion(name) {
  }
}

class ProductVersion {
  name() {
  }

  defaultContentId() {
    return '';
  }

  searchItems() {
    return [];
  }

  sidebarElements() {
    return [];
  }

  getContent(contentId) {
    return null;
  }

  getTitle(contentId) {
    return '';
  }

  getSelectedSidebarElement(contentId) {
    return null;
  }
}
