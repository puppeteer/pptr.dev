class PPTRProduct extends App.Product {
  static async create() {
    const releases = JSON.parse(await fetch('https://api.github.com/repos/GoogleChrome/puppeteer/tags').then(r => r.text())).map(release => ({
      name: 'pptr-' + release.name,
      version: release.name
    }));
    releases[0].name = 'pptr-stable';
    releases.unshift({name: 'latest', version: 'master'});

    const textPromises = [];
    for (const release of releases) {
      const url = `https://raw.githubusercontent.com/GoogleChrome/puppeteer/${release.version}/docs/api.md`;
      textPromises.push(fetch(url).then(response => response.text()));
    }
    const texts = await Promise.all(textPromises);
    for (let i = 0; i < texts.length; ++i)
      releases[i].text = texts[i];
    return new PPTRProduct(releases);
  }

  constructor(releases) {
    super();
    this._releases = releases;
  }

  defaultVersionName() {
    return 'pptr-stable';
  }

  versionNames() {
    return this._releases.map(release => release.name);
  }

  getVersion(name) {
    const release = this._releases.find(release => release.name === name);
    if (!release)
      return null;
    return new PPTRVersion(release.name, release.text);
  }
}

class PPTRVersion extends App.ProductVersion {
  constructor(name, apiText) {
    super();
    this._name = name;

    this.api = APIDocumentation.create(name, apiText);

    this._sidebarElements = [];
    this._entryToSidebarElement = new Map();
    this._initializeSidebarElements();

    this._searchItems = [];
    for (const apiClass of this.api.classes) {
      for (const apiMethod of apiClass.methods) {
        const url = app.linkURL(this.api.version, this.api.entryToId(apiMethod));
        this._searchItems.push(new APIMethodSearchItem(url, apiMethod));
      }
    }
  }

  name() {
    return this._name;
  }

  searchItems() {
    return this._searchItems;
  }

  sidebarElements() {
    return this._sidebarElements;
  }

  content(contentId) {
    contentId = contentId || 'api-overview';
    const entry = this.api.idToEntry(contentId);
    if (!entry)
      return null;
    if (entry instanceof APIClass) {
      const element = this._showAPIClass(entry);
      const title = entry.name;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title, selectedSidebarElement};
    }
    if (entry instanceof APISection) {
      const element = document.createDocumentFragment();
      this._renderElements(element, null, [entry.element]);
      const title = entry.name;
      const selectedSidebarElement = this._entryToSidebarElement.get(entry);
      return {element, title, selectedSidebarElement};
    }
    const element = this._showAPIClass(entry.apiClass);
    const scrollAnchor = this._scrollAnchor(entry.element);
    const title = entry.apiClass.loweredName + '.' + entry.name;
    const selectedSidebarElement = this._entryToSidebarElement.get(entry.apiClass);
    return {element, title, selectedSidebarElement, scrollAnchor};
  }

  _initializeSidebarElements() {
    this._sidebarElements = [];
    const resourcesDivider = document.createElement('sidebar-divider');
    resourcesDivider.textContent = 'Resources';
    this._sidebarElements.push(resourcesDivider);
    this._sidebarElements.push(createItem('Slack', 'https://join.slack.com/t/puppeteer/shared_invite/enQtMzU4MjIyMDA5NTM4LTM1OTdkNDhlM2Y4ZGUzZDdjYjM5ZWZlZGFiZjc4MTkyYTVlYzIzYjU5NDIyNzgyMmFiNDFjN2UzNWU0N2ZhZDc'));
    this._sidebarElements.push(createItem('StackOverflow', 'https://stackoverflow.com/questions/tagged/puppeteer'));
    this._sidebarElements.push(createItem('Github', 'https://github.com/GoogleChrome/puppeteer/issues'));
    this._sidebarElements.push(createItem('ToubleShooting', 'https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md'));

    const apiDivider = document.createElement('sidebar-divider');
    apiDivider.innerHTML = `API <span>${this.api.version}</span>`;
    this._sidebarElements.push(apiDivider);
    for (const section of this.api.sections) {
      const route = app.linkURL(this.api.version, this.api.entryToId(section));
      const item = createItem(section.name, route);
      this._sidebarElements.push(item);
      this._entryToSidebarElement.set(section, item);
    }
    for (const apiClass of this.api.classes) {
      const route = app.linkURL(this.api.version, this.api.entryToId(apiClass));
      const item = createItem(apiClass.name, route);
      this._sidebarElements.push(item);
      this._entryToSidebarElement.set(apiClass, item);
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

  _showAPIClass(apiClass) {
    const fragment = document.createDocumentFragment();

    this._insertBox(fragment).appendChild(apiClass.element);

    this._renderElements(fragment, 'Events', apiClass.events.map(e => e.element));
    this._renderElements(fragment, 'NameSpaces', apiClass.namespaces.map(ns => ns.element));
    this._renderElements(fragment, 'Methods', apiClass.methods.map(method => method.element));
    return fragment;
  }

  _scrollAnchor(entryElement) {
    if (entryElement.previousSibling && entryElement.previousSibling.tagName === 'CONTENT-DELIMETER')
      return entryElement.previousSibling;
    let parentBox = entryElement;
    while (parentBox && parentBox.tagName !== 'CONTENT-BOX')
      parentBox = parentBox.parentElement;
    return parentBox;
  }

  _insertBox(container) {
    const box = document.createElement('content-box');
    container.appendChild(box);
    return box;
  }

  _renderElements(container, title, elements) {
    if (!elements.length)
      return;
    if (title) {
      const header = document.createElement('h3');
      header.textContent = title;
      container.appendChild(header);
    }
    const box = this._insertBox(container);
    let lastDelimeter = null;
    for (const element of elements) {
      box.appendChild(element);
      lastDelimeter = document.createElement('content-delimeter');
      box.appendChild(lastDelimeter);
    }
    lastDelimeter.remove();
  }
}

class APIMethodSearchItem extends SearchComponent.Item {
  constructor(url, apiMethod) {
    super();
    this._className = apiMethod.apiClass.loweredName;
    this._name = apiMethod.name;
    this._args = apiMethod.args;

    const desc = apiMethod.element.querySelector('p');
    this._description = desc ? desc.textContent : '';

    this._subtitleElement = null;
    this._iconElement = null;

    this._url = url;
    this._text = `${this._className}.${this._name}(${this._args})`;
  }

  url() {
    return this._url;
  }

  text() {
    return this._text;
  }

  titleElement(matches) {
    const result = document.createDocumentFragment();

    let index = 0;
    const render = (token, tagName) => {
      const tag = tagName ? document.createElement(tagName) : document.createDocumentFragment();
      tag.appendChild(renderTextWithMatches(this._text, matches, index, index + token.length));
      index += token.length;
      result.appendChild(tag);
    };

    render(this._className + '.', 'search-item-api-method-class');
    render(`${this._name}(${this._args})`, 'search-item-api-method-name');
    return result;
  }

  iconElement() {
    if (!this._iconElement) {
      this._iconElement = document.createElement('method-icon');
    }
    return this._iconElement;
  }

  subtitleElement() {
    if (!this._subtitleElement) {
      this._subtitleElement = document.createElement('div');
      this._subtitleElement.textContent = this._description;
    }
    return this._subtitleElement;
  }
}

/**
 * @param {string} text
 * @param {!Array<number>} matches
 * @param {number} fromIndex
 * @param {number} fromIndex
 * @return {!Element}
 */
function renderTextWithMatches(text, matches, fromIndex, toIndex) {
  if (!matches.length)
    return document.createTextNode(text.substring(fromIndex, toIndex));
  let result = document.createDocumentFragment();
  let insideMatch = false;
  let currentIndex = fromIndex;
  let matchIndex = new Set(matches);
  for (let i = fromIndex; i < toIndex; ++i) {
    if (insideMatch !== matchIndex.has(i)) {
      add(currentIndex, i, insideMatch);
      insideMatch = matchIndex.has(i);
      currentIndex = i;
    }
  }
  add(currentIndex, toIndex, insideMatch);
  return result;

  /**
   * @param {number} from
   * @param {number} to
   * @param {boolean} isHighlight
   */
  function add(from, to, isHighlight) {
    if (to === from)
      return;
    let node = null;
    if (isHighlight) {
      node = document.createElement('search-highlight');
      node.textContent = text.substring(from, to);
    } else {
      node = document.createTextNode(text.substring(from, to));
    }
    result.appendChild(node);
  }
}
